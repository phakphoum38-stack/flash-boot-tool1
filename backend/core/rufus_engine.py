import os
import hashlib
import time
import json

BLOCK = 4 * 1024 * 1024  # 4MB

# =========================
# 🔐 SHA256 HASH
# =========================
def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while True:
            b = f.read(BLOCK)
            if not b:
                break
            h.update(b)
    return h.hexdigest()


# =========================
# 💾 SAVE RESUME STATE
# =========================
def save_state(device, offset):
    with open(f"{device}.state", "w") as f:
        json.dump({"offset": offset}, f)


def load_state(device):
    try:
        with open(f"{device}.state", "r") as f:
            return json.load(f).get("offset", 0)
    except:
        return 0


# =========================
# 🚀 RUFUS ENGINE
# =========================
def write_image_rufus_style(iso_path, device):

    size = os.path.getsize(iso_path)

    print("🔐 Verifying ISO...")
    iso_hash = sha256_file(iso_path)

    offset = load_state(device)

    with open(iso_path, "rb") as src, open(device, "rb+") as dst:

        src.seek(offset)
        dst.seek(offset)

        written = offset

        while True:

            data = src.read(BLOCK)
            if not data:
                break

            dst.write(data)
            dst.flush()

            written += len(data)

            save_state(device, written)

            progress = int((written / size) * 100)

            yield {
                "progress": progress,
                "written": written,
                "status": "writing"
            }

        dst.flush()
        os.fsync(dst.fileno())

    # =========================
    # 🧪 VERIFY PHASE
    # =========================
    print("🧪 Verifying disk...")

    disk_hash = sha256_file(device)

    if disk_hash != iso_hash:
        yield {
            "status": "corrupted",
            "error": "HASH MISMATCH"
        }
        return

    # cleanup state
    try:
        os.remove(f"{device}.state")
    except:
        pass

    yield {
        "progress": 100,
        "status": "done",
        "verified": True
    }
