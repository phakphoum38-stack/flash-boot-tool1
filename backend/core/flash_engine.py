import time

def flash_image(iso, device):

    size = 100

    for i in range(size):
        time.sleep(0.05)

        yield {
            "progress": i + 1,
            "status": "flashing",
            "speed": "120MB/s"
        }

    yield {
        "progress": 100,
        "status": "done"
    }
