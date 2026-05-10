import os

SYSTEM_DISKS = ["sda", "nvme0n1", "disk0"]

def classify_device(device_path: str):
    """
    AI-like heuristic classifier (safe-first engine)
    """

    name = device_path.lower()

    risk = 0

    # 🚨 system disk detection
    if any(x in name for x in SYSTEM_DISKS):
        risk += 100

    # ⚠️ removable heuristic
    if "usb" in name or "removable" in name:
        risk -= 30

    # ⚠️ size heuristic (placeholder)
    try:
        stat = os.stat(device_path)
        if stat.st_size < 32 * 1024**3:
            risk -= 10
    except:
        pass

    return {
        "device": device_path,
        "risk_score": risk,
        "safe": risk < 50
    }