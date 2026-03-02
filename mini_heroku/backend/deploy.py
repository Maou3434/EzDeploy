import os
import sys
import argparse
from utils.extract import extract
from utils.port_utils import get_free_port
from core.detector import detect_runtime
from core.docker_builder import generate_dockerfile, build_image
from core.runner import run_container
from auto_patch import auto_patch

from core.pipeline import DeploymentPipeline

def deploy(zip_path, task_id=None):
    app_name = os.path.splitext(os.path.basename(zip_path))[0]
    
    # If no task_id, we simulate one for CLI use
    if not task_id:
        task_id = f"cli-{int(time.time())}"
        models.init_db()
        models.start_deployment(task_id, app_name)
    
    # Check if app already exists to reuse port
    existing_app = models.get_app_by_name(app_name)
    port = existing_app['port'] if existing_app else None
    
    pipeline = DeploymentPipeline(task_id, zip_path, app_name, port=port)
    success = pipeline.run()
    
    if success:
        return {
            "status": "success",
            "message": f"Deployment success! App live at port {pipeline.port}",
            "app_name": app_name,
            "port": pipeline.port,
            "url": f"http://localhost:{pipeline.port}"
        }
    else:
        return {"status": "error", "message": "Deployment failed. Check stages for details."}

if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Mini Heroku Deployer")
    parser.add_argument("zip_path", help="Path to the application ZIP file")
    args = parser.parse_args()
    
    if not os.path.exists(args.zip_path):
        print(f"File not found: {args.zip_path}")
    else:
        result = deploy(args.zip_path)
        print(result)
