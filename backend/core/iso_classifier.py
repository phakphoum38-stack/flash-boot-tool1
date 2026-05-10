def classify_iso(path):

    p = path.lower()

    if "windows" in p:
        return {"os": "Windows", "boot": "UEFI/BIOS"}

    if "ubuntu" in p or "linux" in p:
        return {"os": "Linux", "boot": "UEFI"}

    return {"os": "Unknown", "boot": "Auto"}
