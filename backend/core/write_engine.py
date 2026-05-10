import os
import time

BLOCK = 8 * 1024 * 1024

def write_stream(image, device):

    written = 0
    start = time.time()
    history = []

    with open(image, "rb") as src:

        while chunk := src.read(BLOCK):

            with open(device, "rb+") as dst:
                dst.seek(written)
                dst.write(chunk)

            written += len(chunk)

            speed = written / max(time.time() - start, 0.1) / (1024*1024)

            history.append(speed)
            if len(history) > 50:
                history.pop(0)

            yield {
                "progress": int(written / os.path.getsize(image) * 100),
                "speed": round(speed, 2),
                "history": history
            }

    yield {"status": "done"}