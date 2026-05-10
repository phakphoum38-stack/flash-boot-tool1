import os

def check_bootable(iso_path):
    try:
        with open(iso_path, "rb") as f:
            data = f.read(2048)

        # 🔎 check MBR / boot signature
        if b"EL TORITO" in data or b"BOOT" in data:
            return {"bootable": True}

        return {"bootable": False}

    except Exception as e:
        return {"error": str(e)}
