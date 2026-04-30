import os
import subprocess
import time
import threading

from backend.core.safety import validate_iso, validate_device

abort_flag = False


def request_abort():
    global abort_flag
    abort_flag = True


def reset_abort():
    global abort_flag
    abort_flag = False


def flash_image(iso_path, device):

    validate_iso(iso_path)
    validate_device(device)

    global abort_flag
    abort_flag = False

    size = os.path.getsize(iso_path)
    block_size = 4 * 1024 * 1024  # 4MB blocks

    written = 0
    start_time = time.time()

    # 🧨 REAL DD PROCESS
    cmd = [
        "sudo",
        "dd",
        f"if={iso_path}",
        f"of={device}",
        "bs=4M",
        "status=progress",
        "oflag=sync"
    ]

    process = subprocess.Popen(
        cmd,
        stderr=subprocess.PIPE,
        stdout=subprocess.PIPE,
        text=True
    )

    while True:

        if abort_flag:
            process.kill()
            yield {
                "status": "aborted"
            }
            return

        output = process.stderr.readline()

        if not output and process.poll() is not None:
            break

        # 📊 parse dd progress
        if "bytes" in output or "copied" in output:
            try:
                parts = output.strip().split()
                for p in parts:
                    if p.isdigit():
                        written = int(p)
                        break
            except:
                pass

        # 📈 speed + ETA
        elapsed = max(time.time() - start_time, 0.1)
        speed = written / elapsed / (1024 * 1024)  # MB/s

        remaining = max(size - written, 0)
        eta = remaining / (speed * 1024 * 1024 + 1)

        progress = int((written / size) * 100) if size else 0

        yield {
            "progress": progress,
            "written_bytes": written,
            "speed_mb_s": round(speed, 2),
            "eta_sec": int(eta),
            "status": "writing"
        }

    yield {
        "progress": 100,
        "status": "done"
    }
