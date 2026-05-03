import subprocess
import time
import os

def flash_iso(iso, device):

    size = os.path.getsize(iso)
    start = time.time()

    cmd = [
        "powershell",
        "-Command",
        f"Get-Content -Path '{iso}' -Encoding Byte -ReadCount 0 | "
        f"Set-Content -Path '{device}' -Encoding Byte"
    ]

    proc = subprocess.Popen(cmd)

    written = 0

    while proc.poll() is None:
        time.sleep(1)

        written += 50 * 1024 * 1024  # fake estimate (ปรับได้)

        percent = min(100, int((written / size) * 100))
        speed = written / (time.time() - start + 1)
        eta = (size - written) / (speed + 1)

        yield {
            "progress": percent,
            "speed": round(speed / 1024 / 1024, 2),
            "eta": int(eta)
        }

    yield {"progress": 100}
