import subprocess

def run_container(image_tag, host_port, env_vars=None):
    """
    Runs a Docker container mapping host_port to container_port.
    env_vars: Dictionary of key-value pairs to inject as environment variables.
    """
    internal_port = 8080 # Standard internal port used by Cloud Run/Heroku often
    
    container_name = f"{image_tag}_container"
    
    # Clean up existing container if any
    subprocess.run(["docker", "rm", "-f", container_name], stderr=subprocess.DEVNULL, stdout=subprocess.DEVNULL)
    
    cmd = [
        "docker", "run", "-d",
        "--name", container_name,
        "-p", f"{host_port}:{internal_port}",
        "-e", f"PORT={internal_port}"
    ]

    # Inject custom environment variables
    if env_vars:
        for key, value in env_vars.items():
            cmd.extend(["-e", f"{key}={value}"])

    cmd.append(image_tag)
    
    print(f"Starting container {container_name} on port {host_port}...")
    try:
        subprocess.run(cmd, check=True)
        return True
    except subprocess.CalledProcessError as e:
        print(f"Failed to run container: {e}")
        return False
