import subprocess

def create_macos_usb(installer_path, usb_path):

    cmd = [
        f"{installer_path}/Contents/Resources/createinstallmedia",
        "--volume",
        usb_path,
        "--nointeraction"
    ]

    process = subprocess.Popen(
        cmd,
        stdout=subprocess.PIPE,
        stderr=subprocess.STDOUT,
        text=True
    )

    for line in process.stdout:
        yield {
            "log": line.strip()
        }

    process.wait()

    if process.returncode != 0:
        yield {"error": "createinstallmedia failed"}
    else:
        yield {"status": "done"}
