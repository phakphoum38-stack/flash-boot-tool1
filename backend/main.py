from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import os
import time
import hashlib
import subprocess
import traceback

app = FastAPI(title="Flash Boot Tool API")

# =========================
# 📦 REQUEST MODEL
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
# 💽 USB DETECT (Windows)
# =========================
@app.get("/devices")
def devices():
    try:
        output = subprocess.check_output(
            ["wmic", "diskdrive", "get", "DeviceID,Model,Size,InterfaceType", "/format:json"]
        )

        import json as j
        data = j.loads(output)

        result = []
        for d in data:
            if d.get("InterfaceType") == "USB":
                result.append({
                    "path": d["DeviceID"],
                    "model": d["Model"],
                    "size": d["Size"]
                })

        return result

    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}


# =========================
# 🔥 FLASH REAL (PROGRESS + SPEED + ETA)
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
                "written_mb": round(written / 1024 / 1024, 2),
                "total_mb": round(total / 1024 / 1024, 2),
                "speed": round(speed / 1024 / 1024, 2),
                "eta": int(eta)
            }

    yield {"progress": 100, "status": "done"}


@app.post("/flash")
def flash(data: FlashRequest):

    if not os.path.exists(data.iso):
        return {"error": "ISO not found"}

    def gen():
        try:
            for update in flash_iso(data.iso, data.device):
                yield json.dumps({"type": "progress", "data": update}) + "\n"

            yield json.dumps({"type": "done"}) + "\n"

        except Exception as e:
            traceback.print_exc()
            yield json.dumps({"type": "error", "message": str(e)}) + "\n"

    return StreamingResponse(gen(), media_type="application/x-ndjson")


# =========================
# 🔐 VERIFY SHA256
# =========================
def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(4 * 1024 * 1024), b""):
            h.update(chunk)
    return h.hexdigest()


@app.post("/verify")
def verify(data: dict):
    try:
        iso = data.get("iso")
        device = data.get("device")

        iso_hash = sha256_file(iso)
        dev_hash = sha256_file(device)

        return {
            "iso_hash": iso_hash,
            "device_hash": dev_hash,
            "match": iso_hash == dev_hash
        }

    except Exception as e:
        return {"error": str(e)}


# =========================
# 🧽 FORMAT USB (diskpart)
# =========================
@app.post("/format")
def format_usb(data: dict):
    try:
        device = data.get("device")
        fs = data.get("fs", "fat32")

        disk_num = device.replace("\\\\.\\PHYSICALDRIVE", "")

        script = f"""
select disk {disk_num}
clean
create partition primary
format fs={fs} quick
assign
exit
"""

        with open("diskpart.txt", "w") as f:
            f.write(script)

        subprocess.run(["diskpart", "/s", "diskpart.txt"], check=True)

        return {"status": "formatted"}

    except Exception as e:
        traceback.print_exc()
        return {"error": str(e)}


# =========================
# 💿 BOOT CHECK
# =========================
@app.post("/boot-check")
def boot_check(data: dict):
    try:
        iso = data.get("iso")

        with open(iso, "rb") as f:
            data = f.read(4096)

        if b"EL TORITO" in data or b"BOOT" in data:
            return {"bootable": True}

        return {"bootable": False}

    except Exception as e:
        return {"error": str(e)}


# =========================
# 🚀 RUN
# =========================
if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host="127.0.0.1", port=8000)
