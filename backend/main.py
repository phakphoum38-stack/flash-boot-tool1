from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel

import os
import time
import json
import hashlib
import subprocess
import tempfile
import shutil
import traceback
import platform

# =========================
# 🧠 SAFE IMPORT (กัน Render พัง)
# =========================
try:
    from macos.detect_macos import is_macos
    from macos.create_installer import create_macos_usb
except:
    def is_macos():
        return False

    def create_macos_usb(*args, **kwargs):
        yield {"error": "macOS feature not available"}

app = FastAPI(title="Flash Boot Tool PRO")

# =========================
# 📦 MODEL
# =========================
class FlashRequest(BaseModel):
    iso: str
    device: str


# =========================
# ❤️ HEALTH
# =========================
@app.get("/")
def root():
    return {"status": "ok"}


# =========================
# 🧠 OS DETECT
# =========================
def get_os():
    return platform.system()


# =========================
# 💽 USB DETECT (AUTO OS)
# =========================
@app.get("/devices")
def devices():
    try:
        output = subprocess.check_output(
            ["wmic", "diskdrive", "get", "DeviceID,Model,Size,InterfaceType", "/format:json"]
        )
        data = json.loads(output)

        result = []

        for d in data:
            if d.get("InterfaceType") != "USB":
                continue

            size_gb = int(d["Size"]) / (1024**3)

            # 🔥 กัน HDD (ใหญ่เกิน = ไม่โชว์)
            if size_gb > 512:
                continue

            result.append({
                "path": d["DeviceID"],
                "model": d["Model"],
                "size": f"{round(size_gb,1)} GB"
            })

        return result

    except Exception as e:
        return {"error": str(e)}

# =========================
# 🔍 DETECT BOOT MODE
# =========================
def detect_boot_mode(iso):
    with open(iso, "rb") as f:
        data = f.read(1024 * 1024)

    return "UEFI" if b"EFI" in data else "BIOS"


# =========================
# 🔥 RAW FLASH (ใช้ได้ทุก OS)
# =========================
def flash_iso(iso_path, device_path):

    CHUNK = 4 * 1024 * 1024
    total = os.path.getsize(iso_path)
    written = 0
    start = time.time()

    with open(iso_path, "rb") as src, open(device_path, "wb") as dst:

        while True:
            chunk = src.read(CHUNK)
            if not chunk:
                break

            dst.write(chunk)
            dst.flush()

            written += len(chunk)

            elapsed = time.time() - start
            speed = written / elapsed if elapsed > 0 else 0
            eta = (total - written) / speed if speed > 0 else 0

            percent = int((written / total) * 100)

            yield {
                "progress": percent,
                "speed": round(speed / 1024 / 1024, 2),  # MB/s
                "eta": int(eta),  # seconds
                "written": written,
                "total": total
            }

    yield {
        "progress": 100,
        "status": "done"
    }


# =========================
# 🚀 SMART FLASH (ISO RAW)
# =========================
@app.post("/flash")
def flash(data: FlashRequest):

    def gen():
        try:
            for p in flash_iso(data.iso, data.device):
                yield json.dumps(p) + "\n"
        except Exception as e:
            yield json.dumps({"error": str(e)}) + "\n"

    return StreamingResponse(gen(), media_type="application/x-ndjson")


# =========================
# 🍎 MACOS FLASH
# =========================
@app.post("/macos-flash")
def macos_flash(data: dict):

    if not is_macos():
        return {"error": "macOS only feature"}

    installer = data.get("installer")
    usb = data.get("usb")

    def gen():
        try:
            for line in create_macos_usb(installer, usb):
                yield json.dumps(line) + "\n"
        except Exception as e:
            yield json.dumps({"error": str(e)}) + "\n"

    return StreamingResponse(gen(), media_type="application/x-ndjson")


# =========================
# 🔐 VERIFY SHA256
# =========================
@app.post("/verify")
def verify(data: dict):
    try:
        def sha256(path):
            h = hashlib.sha256()
            with open(path, "rb") as f:
                for chunk in iter(lambda: f.read(4 * 1024 * 1024), b""):
                    h.update(chunk)
            return h.hexdigest()

        return {
            "match": sha256(data["iso"]) == sha256(data["device"])
        }

    except Exception as e:
        return {"error": str(e)}


# =========================
# 🚀 RUN
# =========================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
