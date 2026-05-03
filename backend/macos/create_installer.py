import subprocess

def create_macos_usb(installer_path, usb_path):
    try:
        cmd = [
            f"{installer_path}/Contents/Resources/createinstallmedia",
            "--volume",
            usb_path,
            "--nointeraction"
        ]

        subprocess.run(cmd, check=True)

        return {"status": "done"}

    except Exception as e:
        return {"error": str(e)}
