from collections import deque
import threading

queue = deque()
running = False


def add_job(job):
    queue.append(job)


def worker(engine):

    global running

    if running:
        return

    running = True

    while queue:

        job = queue.popleft()

        retries = 3

        while retries > 0:
            try:
                for event in engine(job["image"], job["device"]):
                    job["callback"](event)
                break
            except Exception:
                retries -= 1

        if retries == 0:
            job["callback"]({"status": "failed"})

    running = False