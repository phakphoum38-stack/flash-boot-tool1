def validate_iso(path):
    if not path.endswith((".iso", ".dmg")):
        raise Exception("Invalid image file")

    if not os.path.exists(path):
        raise Exception("ISO not found")


def validate_device(device):
    if not device.startswith("/dev/"):
        raise Exception("Invalid device")

    # 🧨 กันลบ disk หลัก
    blacklist = ["/dev/sda", "/dev/nvme0n1"]
    if device in blacklist:
        raise Exception("Blocked system disk")
