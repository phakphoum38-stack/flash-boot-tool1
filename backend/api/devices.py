from fastapi import APIRouter
import subprocess

router = APIRouter()

@router.get("/devices")
def get_devices():

    # 📌 Linux: list block devices
    result = subprocess.getoutput("lsblk -J")

    import json
    data = json.loads(result)

    devices = []

    for d in data["blockdevices"]:
        if "sd" in d["name"] or "usb" in d.get("tran", ""):
            devices.append({
                "name": d["name"],
                "path": "/dev/" + d["name"],
                "size": d.get("size", "unknown")
            })

    return devices
