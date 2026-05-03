def calculate_risk(device, iso_info):

    risk = 0

    # system disk detection (Rufus safety)
    if "nvme" in device:
        risk += 80

    if "sda" in device:
        risk += 70

    if iso_info.get("os") == "Windows":
        risk += 10

    if iso_info.get("os") == "Unknown":
        risk += 30

    return {
        "risk_score": risk,
        "safe": risk < 70
    }
