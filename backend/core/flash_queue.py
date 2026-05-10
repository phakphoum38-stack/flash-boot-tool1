import queue
import threading
from backend.core.rufus_engine import write_image_rufus_style
from backend.core.device_ai import update_success, update_failure, classify_device

flash_queue = queue.Queue()

# =========================
# ➕ ADD TASK
# =========================
def add_task(iso, device):

    risk = classify_device(device)

    flash_queue.put({
        "iso": iso,
        "device": device,
        "risk": risk
    })


# =========================
# ⚙️ WORKER
# =========================
def worker():

    while True:

        task = flash_queue.get()

        iso = task["iso"]
        device = task["device"]

        try:
            for p in write_image_rufus_style(iso, device):

                yield p

            update_success(device, 10)

        except Exception as e:
            update_failure(device, str(e))


# =========================
# 🚀 START POOL
# =========================
def start_workers(n=2):

    for _ in range(n):
        t = threading.Thread(target=worker, daemon=True)
        t.start()
