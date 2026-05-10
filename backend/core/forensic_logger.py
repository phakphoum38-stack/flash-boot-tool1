import time
import json
import os

LOG_FILE = "logs/forensic.log"


def log_event(event):

    os.makedirs("logs", exist_ok=True)

    entry = {
        "time": time.time(),
        "event": event
    }

    with open(LOG_FILE, "a") as f:
        f.write(json.dumps(entry) + "\n")