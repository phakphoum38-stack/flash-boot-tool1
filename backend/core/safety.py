def validate_device(device):

    blacklist = [
        "/dev/sda",
        "/dev/nvme0n1",
        "/dev/disk0"
    ]

    if device in blacklist:
        raise Exception("🚨 SYSTEM DISK PROTECTED")

    if not device.startswith("/dev/"):
        raise Exception("Invalid device")
