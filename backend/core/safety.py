def validate_iso(path):
    if not path.endswith((".iso", ".dmg")):
        raise Exception("Invalid image file")


def validate_device(device):
    if not device.startswith("/dev"):
        raise Exception("Invalid device")
