from fastapi import APIRouter
import subprocess
import json

router = APIRouter()


def get_usb_devices():

    # 🧠 Linux real block devices
    cmd = "lsblk -J -o NAME,SIZE,MODEL,TRAN,MOUNTPOINT"
    result = subprocess.getoutput(cmd)

    data = json.loads(result)

    devices = []

    for d in data["blockdevices"]:

        # 💽 filter USB only
        if d.get("tran") == "usb" or "sd" in d["name"]:

            devices.append({
                "name": d["name"],
                "path": f"/dev/{d['name']}",
                "size": d.get("size"),
                "model": d.get("model"),
                "mount": d.get("mountpoint")
            })

    return devices


@router.get("/devices")
def devices():
    return get_usb_devices()
