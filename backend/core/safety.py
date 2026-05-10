def hard_protect(device):

    blacklist = [
        "/dev/sda",
        "/dev/nvme0n1",
        "C:",
        "/dev/disk0"
    ]

    if any(x.lower() in device.lower() for x in blacklist):
        raise Exception("CRITICAL SYSTEM DISK BLOCKED")