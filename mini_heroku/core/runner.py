import subprocess

def run_container(image_tag, host_port, container_port=None):
    """
    Runs a Docker container mapping host_port to container_port.
    If container_port is None, it tries to infer it or assumes default based on runtime naming convention if possible,
    but simpler to pass it or rely on internal ENV.
    For this MVP, we pass PORT env var to container and map host_port to it.
    """
    # Assuming the app respects the PORT env var (which our patcher ensures)
    # or the Dockerfile EXPOSEs a specific port.
    # For simplicity, we'll map host_port:8000 for python and host_port:3000 for node if not specified,
    # BUT, a better way for "mini-heroku" is to tell the app which port to listen on via ENV.
    
    # We will tell the container to listen on 'internal_port' and map 'host_port' to it.
    internal_port = 8080 # Standard internal port used by Cloud Run/Heroku often
    
    container_name = f"{image_tag}_container"
    
    # Clean up existing container if any
    subprocess.run(["docker", "rm", "-f", container_name], stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)
    
    cmd = [
        "docker", "run", "-d",
        "--name", container_name,
        "-p", f"{host_port}:{internal_port}",
        "-e", f"PORT={internal_port}",
        image_tag
    ]
    
    print(f"Starting container {container_name} on port {host_port}...")
    try:
        subprocess.run(cmd, check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Failed to run container: {e}")
        return False
