import time

def flash_image(iso, device):

    size = 1000000000
    written = 0

    while written < size:

        written += 5_000_000
        time.sleep(0.05)

        progress = int((written / size) * 100)

        speed = 120 + (progress % 30)
        eta = (size - written) / (speed * 1024 * 1024)

        yield {
            "progress": progress,
            "speed": round(speed, 2),
            "eta": int(eta),
            "status": "writing"
        }

    yield {"progress": 100, "status": "done"}
