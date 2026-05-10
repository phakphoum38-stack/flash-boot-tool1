import subprocess
import json

def list_usb():
    result = subprocess.check_output(
        ["wmic", "diskdrive", "get", "DeviceID,Model,Size,InterfaceType", "/format:json"]
    )

    data = json.loads(result)

    devices = []

    for d in data:
        if d.get("InterfaceType") == "USB":
            devices.append({
                "path": d["DeviceID"],
                "model": d["Model"],
                "size": d["Size"]
            })

    return devices
