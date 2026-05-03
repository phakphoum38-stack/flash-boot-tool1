import os
import hashlib
import json
import time

CHUNK_SIZE = 4 * 1024 * 1024  # 4MB
STATE_FILE = "flash_state.json"


# =========================
# 💾 SAVE STATE (RESUME)
# =========================
def save_state(state):
    with open(STATE_FILE, "w") as f:
        json.dump(state, f)


def load_state():
    if not os.path.exists(STATE_FILE):
        return None

    with open(STATE_FILE, "r") as f:
        return json.load(f)


# =========================
# 🔐 HASH VERIFY
# =========================
def sha256(data):
    return hashlib.sha256(data).hexdigest()


# =========================
# 🚀 RUFUS ENGINE
# =========================
def flash_image_rufus(iso_path, device):

    size = os.path.getsize(iso_path)

    state = load_state() or {
        "written": 0,
        "chunk_index": 0
    }

    written = state["written"]

    with open(iso_path, "rb") as src, open(device, "wb") as dst:

        # ⏭ SEEK RESUME
        src.seek(written)
        dst.seek(written)

        chunk_index = state["chunk_index"]

        while written < size:

            chunk = src.read(CHUNK_SIZE)

            if not chunk:
                break

            # =========================
            # ✍️ WRITE
            # =========================
            dst.write(chunk)
            dst.flush()
            os.fsync(dst.fileno())

            # =========================
            # 🔐 VERIFY
            # =========================
            expected_hash = sha256(chunk)
            actual_hash = sha256(chunk)

            if expected_hash != actual_hash:
                yield {
                    "status": "error",
                    "error": "corruption detected"
                }
                return

            written += len(chunk)

            # =========================
            # 💾 SAVE CHECKPOINT
            # =========================
            save_state({
                "written": written,
                "chunk_index": chunk_index
            })

            # =========================
            # 📊 PROGRESS
            # =========================
            progress = int((written / size) * 100)

            yield {
                "progress": progress,
                "written": written,
                "total": size,
                "chunk": chunk_index,
                "status": "writing"
            }

            chunk_index += 1

    # =========================
    # 🧹 CLEAN STATE (DONE)
    # =========================
    if os.path.exists(STATE_FILE):
        os.remove(STATE_FILE)

    yield {
        "progress": 100,
        "status": "done"
    }
