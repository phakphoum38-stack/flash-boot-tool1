import os
import shutil
import subprocess

def build():

    if os.path.exists("dist"):
        shutil.rmtree("dist")

    subprocess.run([
        "pyinstaller",
        "--onefile",
        "--name", "backend",
        "--add-data", "backend:backend",
        "backend/main.py"
    ])

if __name__ == "__main__":
    build()
