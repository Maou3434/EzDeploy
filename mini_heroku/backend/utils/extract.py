import zipfile
import os

def extract(zip_path, dest):
    """
    Extracts a zip file to a destination directory.
    """
    os.makedirs(dest, exist_ok=True)
    with zipfile.ZipFile(zip_path, 'r') as z:
        z.extractall(dest)

