from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
import json
import os
import time
import hashlib
import subprocess
import traceback

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
# 💽 USB DETECT
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
# 🔍 DETECT UEFI / BIOS
# =========================
def detect_boot_mode(iso_path):
    try:
        with open(iso_path, "rb") as f:
            data = f.read(1024 * 1024)

        if b"EFI" in data:
            return "UEFI"
        return "BIOS"

    except:
        return "UNKNOWN"


# =========================
# 🧽 AUTO PARTITION (GPT/MBR)
# =========================
def auto_partition(device, iso):

    disk_num = device.replace("\\\\.\\PHYSICALDRIVE", "")
    mode = detect_boot_mode(iso)

    if mode == "UEFI":
        scheme = "GPT"
        script = f"""
select disk {disk_num}
clean
convert gpt
create partition primary
format fs=fat32 quick
assign
exit
"""
    else:
        scheme = "MBR"
        script = f"""
select disk {disk_num}
clean
convert mbr
create partition primary
active
format fs=ntfs quick
assign
exit
"""

    with open("diskpart.txt", "w") as f:
        f.write(script)

    subprocess.run(["diskpart", "/s", "diskpart.txt"], check=True)

    return {"mode": mode, "scheme": scheme}


@app.post("/auto-partition")
def auto_partition_api(data: dict):
    try:
        return auto_partition(data.get("device"), data.get("iso"))
    except Exception as e:
        return {"error": str(e)}


# =========================
# 🔥 FLASH (REAL PROGRESS)
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
                "speed": round(speed / 1024 / 1024, 2),
                "eta": int(eta)
            }

    yield {"progress": 100, "status": "done"}


# =========================
# 🚀 SMART FLASH (AUTO EVERYTHING)
# =========================
@app.post("/smart-flash")
def smart_flash(data: FlashRequest):

    if not os.path.exists(data.iso):
        return {"error": "ISO not found"}

    def gen():
        try:
            # 1️⃣ partition
            part = auto_partition(data.device, data.iso)
            yield json.dumps({"type": "partition", "data": part}) + "\n"

            # 2️⃣ flash
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
        iso_hash = sha256_file(data.get("iso"))
        dev_hash = sha256_file(data.get("device"))

        return {
            "match": iso_hash == dev_hash
        }

    except Exception as e:
        return {"error": str(e)}


# =========================
# 💿 BOOT CHECK
# =========================
@app.post("/boot-check")
def boot_check(data: dict):
    try:
        with open(data.get("iso"), "rb") as f:
            d = f.read(4096)

        return {"bootable": b"EFI" in d or b"BOOT" in d}

    except Exception as e:
        return {"error": str(e)}


# =========================
# 🚀 RUN
# =========================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
