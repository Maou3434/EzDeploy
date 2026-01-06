import os
import shutil
import subprocess

DOCKERFILES_DIR = os.path.join(os.path.dirname(__file__), '..', 'dockerfiles')

def generate_dockerfile(app_path, runtime):
    """
    Copies the appropriate Dockerfile template to the app directory.
    """
    if runtime == 'python':
        src = os.path.join(DOCKERFILES_DIR, 'python.Dockerfile')
    elif runtime == 'node':
        src = os.path.join(DOCKERFILES_DIR, 'node.Dockerfile')
    else:
        raise ValueError(f"Unsupported runtime: {runtime}")
    
    dest = os.path.join(app_path, 'Dockerfile')
    shutil.copy(src, dest)
    print(f"Generated Dockerfile for {runtime} at {dest}")

def build_image(app_path, tag):
    """
    Builds the Docker image from the app directory.
    """
    cmd = ["docker", "build", "-t", tag, "."]
    print(f"Building Docker image: {tag}...")
    try:
        subprocess.run(cmd, cwd=app_path, check=True)
        print(f"Successfully built image: {tag}")
        return True
    except subprocess.CalledProcessError as e:
        print(f"Failed to build image: {e}")
        return False
