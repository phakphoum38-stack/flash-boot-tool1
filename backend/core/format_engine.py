import subprocess

def format_device(device, fstype="fat32"):

    # ⚠️ WARNING: destructive operation
    cmd = []

    if fstype == "fat32":
        cmd = ["mkfs.vfat", "-F", "32", device]

    elif fstype == "exfat":
        cmd = ["mkfs.exfat", device]

    elif fstype == "ntfs":
        cmd = ["mkfs.ntfs", "-f", device]

    else:
        raise Exception("Unsupported format")

    result = subprocess.getoutput(" ".join(cmd))

    return {
        "device": device,
        "format": fstype,
        "result": result
    }
