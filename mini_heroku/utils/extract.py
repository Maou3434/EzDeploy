import zipfile
import os

def extract(zip_path, dest):
    with zipfile.ZipFile(zip_path, 'r') as z:
        z.extractall(dest)

os.makedirs("builds/Flask_App_1", exist_ok=True)
os.makedirs("builds/Node_App_1", exist_ok=True)

extract("uploads/Flask_App_1.zip", "builds/Flask_App_1")
extract("uploads/Node_App_1.zip", "builds/Node_App_1")
