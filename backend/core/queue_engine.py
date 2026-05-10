from collections import deque
import threading

flash_queue = deque()
running = False

def add_job(job):
    flash_queue.append(job)


def worker(engine_func):
    global running

    if running:
        return

    running = True

    while flash_queue:
        job = flash_queue.popleft()

        for event in engine_func(job["iso"], job["device"]):
            job["callback"](event)

    running = False