import os

BLACKLIST = [
    "/dev/sda",
    "/dev/nvme0n1",
    "/dev/root",
    "/dev/disk0"
]

def validate_iso(path):
    if not path:
        raise Exception("Empty path")

    if not path.endswith((".iso", ".dmg")):
        raise Exception("Invalid image file")

    if not os.path.exists(path):
        raise Exception("ISO not found")


def validate_device(device):

    if not device.startswith("/dev/"):
        raise Exception("Invalid device")

    if device in BLACKLIST:
        raise Exception("🚨 SYSTEM DISK BLOCKED")

    # กัน partition หลัก (Etcher style safety)
    if "disk0" in device or "sda" in device:
        raise Exception("Protected system disk")
