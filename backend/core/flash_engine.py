import os
import subprocess
import time

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

    written = 0
    start_time = time.time()

    cmd = [
        "sudo", "dd",
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
            yield {"status": "aborted"}
            return

        output = process.stderr.readline()

        if not output and process.poll() is not None:
            break

        if "bytes" in output:
            try:
                for p in output.split():
                    if p.isdigit():
                        written = int(p)
                        break
            except:
                pass

        elapsed = max(time.time() - start_time, 0.1)

        # ⚡ FIXED speed calc (MB/s correct)
        speed = (written / 1024 / 1024) / elapsed

        remaining = max(size - written, 0)
        eta = (remaining / (speed * 1024 * 1024 + 1)) if speed > 0 else 0

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
