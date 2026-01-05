import os
import sys
import argparse
from utils.extract import extract
from utils.port_utils import get_free_port
from core.detector import detect_runtime
from core.docker_builder import generate_dockerfile, build_image
from core.runner import run_container
from auto_patch import auto_patch

def deploy(zip_path):
    print(f"Deploying {zip_path}...")
    
    # 1. Prepare Paths
    app_name = os.path.splitext(os.path.basename(zip_path))[0]
    build_dir = os.path.join("builds", app_name)
    
    # 2. Extract
    print(f"Extracting to {build_dir}...")
    extract(zip_path, build_dir)
    
    # Handle single nested directory
    entries = [e for e in os.listdir(build_dir) if not e.startswith('__')] # Ignore __MACOSX
    if len(entries) == 1 and os.path.isdir(os.path.join(build_dir, entries[0])):
        print(f"Detected nested directory: {entries[0]}. Adjusting build root.")
        build_dir = os.path.join(build_dir, entries[0])
    
    # 3. Detect Runtime
    runtime = detect_runtime(build_dir)
    print(f"Detected runtime: {runtime}")
    if runtime == "unknown":
        print("Error: Could not detect runtime. Aborting.")
        return

    # 4. Auto Patch
    print("Auto-patching application...")
    auto_patch(build_dir, runtime)
    
    # 5. Generate Dockerfile
    print("Generating Dockerfile...")
    generate_dockerfile(build_dir, runtime)
    
    # 6. Build Image
    image_tag = app_name.lower()
    print(f"Building image {image_tag}...")
    if not build_image(build_dir, image_tag):
        print("Build failed.")
        return

    # 7. Get Free Port
    port = get_free_port()
    print(f"Allocated port: {port}")
    
    # 8. Run Container
    print("Running container...")
    if run_container(image_tag, port):
        print("\n" + "="*30)
        print(f"DEPLOYMENT SUCCESS!")
        print(f"App is running at: http://localhost:{port}")
        print("="*30 + "\n")
    else:
        print("Deployment failed.")

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Mini Heroku Deployer")
    parser.add_argument("zip_path", help="Path to the application ZIP file")
    args = parser.parse_args()
    
    if not os.path.exists(args.zip_path):
        print(f"File not found: {args.zip_path}")
    else:
        deploy(args.zip_path)
