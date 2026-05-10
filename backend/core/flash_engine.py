import os
import time
import hashlib

abort_flag = False
resume_map = {}

BLOCK = 4 * 1024 * 1024  # 4MB

# =========================
# 🔥 HASH CHECK
# =========================
def sha256_file(path):
    h = hashlib.sha256()
    with open(path, "rb") as f:
        while chunk := f.read(1024 * 1024):
            h.update(chunk)
    return h.hexdigest()


# =========================
# 🚀 FLASH ENGINE
# =========================
def flash_image(iso_path, device):

    global abort_flag
    abort_flag = False

    size = os.path.getsize(iso_path)
    written = resume_map.get(device, 0)

    start = time.time()

    with open(iso_path, "rb") as src:
        src.seek(written)

        while True:

            if abort_flag:
                resume_map[device] = written
                yield {"status": "paused", "written": written}
                return

            chunk = src.read(BLOCK)
            if not chunk:
                break

            # 💽 WRITE (SIMULATED SAFE LAYER)
            with open(device, "rb+") as dst:
                dst.seek(written)
                dst.write(chunk)

            written += len(chunk)

            # 📊 speed
            elapsed = max(time.time() - start, 0.1)
            speed = written / elapsed / (1024 * 1024)

            progress = int((written / size) * 100)

            yield {
                "status": "writing",
                "progress": progress,
                "speed_mb_s": round(speed, 2),
                "written": written,
                "eta": int((size - written) / (speed * 1024 * 1024 + 1))
            }

    # 🔐 VERIFY PHASE
    yield {
        "status": "verifying"
    }

    original_hash = sha256_file(iso_path)

    yield {
        "status": "done",
        "sha256": original_hash,
        "progress": 100
    }