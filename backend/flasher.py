import os
import time

CHUNK_SIZE = 4 * 1024 * 1024  # 4MB


def flash_iso(iso_path, device_path):

    total_size = os.path.getsize(iso_path)
    written = 0

    start_time = time.time()

    try:
        with open(iso_path, "rb") as src, open(device_path, "wb") as dst:

            while True:
                chunk = src.read(CHUNK_SIZE)

                if not chunk:
                    break

                dst.write(chunk)
                dst.flush()

                written += len(chunk)

                # ⏱ คำนวณจริง
                elapsed = time.time() - start_time
                speed = written / elapsed if elapsed > 0 else 0
                eta = (total_size - written) / speed if speed > 0 else 0
                percent = int((written / total_size) * 100)

                yield {
                    "progress": percent,
                    "written_mb": round(written / 1024 / 1024, 2),
                    "total_mb": round(total_size / 1024 / 1024, 2),
                    "speed": round(speed / 1024 / 1024, 2),  # MB/s
                    "eta": int(eta)
                }

        # ✅ เสร็จ
        yield {
            "progress": 100,
            "status": "done"
        }

    except Exception as e:
        yield {
            "error": str(e)
        }
