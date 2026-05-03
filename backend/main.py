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
        data = json.loads(output)

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
        return {"error": str(e)}


# =========================
# 🔍 DETECT BOOT MODE
# =========================
def detect_boot_mode(iso):
    with open(iso, "rb") as f:
        data = f.read(1024 * 1024)

    return "UEFI" if b"EFI" in data else "BIOS"


# =========================
# 🧽 AUTO PARTITION
# =========================
def auto_partition(device, iso):

    disk = device.replace("\\\\.\\PHYSICALDRIVE", "")
    mode = detect_boot_mode(iso)

    if mode == "UEFI":
        script = f"""
select disk {disk}
clean
convert gpt
create partition primary
format fs=fat32 quick
assign
exit
"""
    else:
        script = f"""
select disk {disk}
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

    return {"mode": mode}


# =========================
# 🔍 GET DRIVE LETTER AUTO
# =========================
def get_drive_letter(device):

    disk = device.replace("\\\\.\\PHYSICALDRIVE", "")

    cmd = f"""
$disk = Get-Disk -Number {disk}
$part = $disk | Get-Partition | Where {{$_.DriveLetter}} | Select -First 1
$part.DriveLetter
"""

    out = subprocess.check_output(
        ["powershell", "-Command", cmd]
    ).decode().strip()

    return f"{out}:\\"


# =========================
# 📦 EXTRACT ISO
# =========================
def extract_iso(iso):
    temp = tempfile.mkdtemp()

    subprocess.run([
        "powershell",
        "-Command",
        f"Mount-DiskImage -ImagePath '{iso}'"
    ])

    drive = subprocess.check_output(
        ["powershell", "-Command", "(Get-DiskImage | Get-Volume).DriveLetter"]
    ).decode().strip().split()[-1]

    shutil.copytree(f"{drive}:\\", temp, dirs_exist_ok=True)

    subprocess.run([
        "powershell",
        "-Command",
        f"Dismount-DiskImage -ImagePath '{iso}'"
    ])

    return temp


# =========================
# 🪟 SPLIT WIM
# =========================
def split_wim(path):

    wim = os.path.join(path, "sources", "install.wim")

    if not os.path.exists(wim):
        return

    subprocess.run([
        "dism",
        "/Split-Image",
        f"/ImageFile:{wim}",
        f"/SWMFile:{wim.replace('.wim','.swm')}",
        "/FileSize:3800"
    ])

    os.remove(wim)


# =========================
# 📂 COPY FILES
# =========================
def copy_files(src, dst):

    total = sum(
        os.path.getsize(os.path.join(r, f))
        for r, _, files in os.walk(src)
        for f in files
    )

    written = 0

    for root, _, files in os.walk(src):
        for f in files:

            s = os.path.join(root, f)
            rel = os.path.relpath(s, src)
            d = os.path.join(dst, rel)

            os.makedirs(os.path.dirname(d), exist_ok=True)

            with open(s, "rb") as sf, open(d, "wb") as df:
                while True:
                    chunk = sf.read(1024 * 1024)
                    if not chunk:
                        break

                    df.write(chunk)
                    written += len(chunk)

                    yield {
                        "progress": int((written / total) * 100)
                    }


# =========================
# 🚀 WINDOWS FLASH (AUTO)
# =========================
@app.post("/windows-flash")
def windows_flash(data: FlashRequest):

    def gen():
        try:
            yield json.dumps({"step": "partition"}) + "\n"
            auto_partition(data.device, data.iso)

            yield json.dumps({"step": "detect_usb"}) + "\n"
            usb = get_drive_letter(data.device)

            yield json.dumps({"usb": usb}) + "\n"

            yield json.dumps({"step": "extract"}) + "\n"
            path = extract_iso(data.iso)

            yield json.dumps({"step": "split_wim"}) + "\n"
            split_wim(path)

            yield json.dumps({"step": "copy"}) + "\n"
            for p in copy_files(path, usb):
                yield json.dumps({"type": "progress", "data": p}) + "\n"

            yield json.dumps({"type": "done"}) + "\n"

        except Exception as e:
            yield json.dumps({"error": str(e)}) + "\n"

    return StreamingResponse(gen(), media_type="application/x-ndjson")


# =========================
# 🚀 RUN
# =========================
if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="127.0.0.1", port=8000)
