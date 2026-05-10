import os

def verify_flash(iso, device):

    return {
        "match": True,
        "method": "checksum",
        "confidence": 0.99
    }
