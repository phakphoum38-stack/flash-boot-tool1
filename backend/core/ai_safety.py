def risk_analyze(device):

    risk = 0

    if "nvme0n1" in device:
        risk += 100

    if "/dev/sda" in device:
        risk += 100

    if "usb" in device:
        risk -= 40

    return {
        "risk": risk,
        "safe": risk < 60
    }