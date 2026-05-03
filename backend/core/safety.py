def verify_device(device):
    blacklist = ["/dev/sda", "/dev/nvme0n1", "/dev/root"]

    if device in blacklist:
        raise Exception("🚨 SYSTEM DISK BLOCKED")

    if not device.startswith("/dev/"):
        raise Exception("INVALID DEVICE")
