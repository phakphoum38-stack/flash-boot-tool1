import hashlib

def sha256_file(path):
    h = hashlib.sha256()

    with open(path, "rb") as f:
        for chunk in iter(lambda: f.read(4 * 1024 * 1024), b""):
            h.update(chunk)

    return h.hexdigest()


def verify_flash(iso_path, device_path):
    try:
        iso_hash = sha256_file(iso_path)

        # ⚠️ อ่านจาก device (บางระบบอาจต้อง admin)
        dev_hash = sha256_file(device_path)

        return {
            "iso_hash": iso_hash,
            "device_hash": dev_hash,
            "match": iso_hash == dev_hash
        }

    except Exception as e:
        return {"error": str(e)}
