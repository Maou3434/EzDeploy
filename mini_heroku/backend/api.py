import os
import sys
import subprocess
import uuid
from concurrent.futures import ThreadPoolExecutor
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

from deploy import deploy
import models

app = Flask(__name__)
CORS(app) # Allow Cross-Origin requests for React frontend

UPLOAD_FOLDER = os.path.join(os.path.dirname(__file__), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

# Executor for background tasks
executor = ThreadPoolExecutor(max_workers=4)

def run_deployment_async(task_id, filepath, app_name):
    """
    Background worker for deployment.
    """
    try:
        result = deploy(filepath, task_id=task_id)
        
        if result.get("status") == "success":
            models.update_deployment(task_id, 'success', result.get("message"))
            # Ensure app exists and is updated in database
            existing_app = models.get_app_by_name(app_name)
            if existing_app:
                models.update_app(app_name, port=result.get('port'))
            else:
                models.create_app(app_name, runtime=None, port=result.get('port'))
        else:
            models.update_deployment(task_id, 'error', result.get("message", "Unknown deployment error"))
            
    except Exception as e:
        models.update_deployment(task_id, 'error', str(e))

@app.route('/api/deploy', methods=['POST'])
def deploy_app():
    if 'file' not in request.files:
        return jsonify({"status": "error", "message": "No file part"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"status": "error", "message": "No selected file"}), 400
    
    if file:
        filename = secure_filename(file.filename)
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        file.save(filepath)
        
        app_name = os.path.splitext(filename)[0]
        task_id = str(uuid.uuid4())
        
        # Check if app already exists to reuse port
        existing_app = models.get_app_by_name(app_name)
        port = existing_app['port'] if existing_app else None
        
        # Initialize deployment tracking
        models.start_deployment(task_id, app_name)
        
        def run_deploy_async():
            try:
                from deploy import DeploymentPipeline
                pipeline = DeploymentPipeline(task_id, filepath, app_name, port=port)
                success = pipeline.run()
                if success:
                    models.update_deployment(task_id, 'success', f"Deployed successfully to port {pipeline.port}")
                    if existing_app:
                        models.update_app(app_name, port=pipeline.port)
                    else:
                        models.create_app(app_name, runtime=None, port=pipeline.port)
                else:
                    models.update_deployment(task_id, 'error', "Deployment failed.")
            except Exception as e:
                models.update_deployment(task_id, 'error', str(e))

        # Trigger deployment in background
        executor.submit(run_deploy_async)
        
        return jsonify({
            "status": "accepted",
            "task_id": task_id,
            "message": "Deployment started"
        }), 202

def resolve_app_name(app_name):
    """
    Helper to map potential container names (e.g., flask_app_1_container) 
    back to the actual build directory name (e.g., Flask_App_1).
    """
    builds_dir = os.path.join(os.path.dirname(__file__), 'builds')
    if not os.path.exists(builds_dir):
        return None
    
    # Normalize target name
    target = app_name.lower()
    if target.endswith('_container'):
        target = target[:-10]
    
    try:
        # Search for a case-insensitive match in the builds directory
        for d in os.listdir(builds_dir):
            if d.lower() == target:
                return d
    except Exception:
        pass
        
    # Fallback to exact match if search fails
    if os.path.exists(os.path.join(builds_dir, app_name)):
        return app_name
        
    return None

# Deployment Status Endpoint
@app.route('/api/deploy/status/<task_id>', methods=['GET'])
def get_deployment_status(task_id):
    status = models.get_deployment(task_id)
    if not status:
        return jsonify({"error": "Task not found"}), 404
    return jsonify(status)

# File Management for Code Editor
@app.route('/api/files/<app_name>', methods=['GET'])
def list_app_files(app_name):
    resolved_name = resolve_app_name(app_name)
    if not resolved_name:
        return jsonify({"error": f"App '{app_name}' not found"}), 404
        
    app_path = os.path.join(os.path.dirname(__file__), 'builds', resolved_name)
    
    files = []
    for root, dirs, filenames in os.walk(app_path):
        for f in filenames:
            rel_path = os.path.relpath(os.path.join(root, f), app_path)
            if not rel_path.startswith('.') and 'node_modules' not in rel_path and '__pycache__' not in rel_path:
                files.append(rel_path)
    return jsonify(files)

@app.route('/api/files/<app_name>/read', methods=['GET'])
def read_app_file(app_name):
    rel_path = request.args.get('path')
    if not rel_path:
        return jsonify({"error": "Path required"}), 400
    
    resolved_name = resolve_app_name(app_name)
    if not resolved_name:
        return jsonify({"error": f"App '{app_name}' not found"}), 404

    app_path = os.path.join(os.path.dirname(__file__), 'builds', resolved_name)
    full_path = os.path.join(app_path, rel_path)
    
    if not os.path.exists(full_path):
        return jsonify({"error": "File not found"}), 404
        
    try:
        with open(full_path, 'r') as f:
            content = f.read()
        return jsonify({"content": content})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/files/<app_name>/write', methods=['POST'])
def write_app_file(app_name):
    data = request.json
    rel_path = data.get('path')
    content = data.get('content')
    
    if not rel_path or content is None:
        return jsonify({"error": "Path and content required"}), 400
    
    resolved_name = resolve_app_name(app_name)
    if not resolved_name:
        return jsonify({"error": f"App '{app_name}' not found"}), 404

    app_path = os.path.join(os.path.dirname(__file__), 'builds', resolved_name)
    full_path = os.path.join(app_path, rel_path)
    
    try:
        os.makedirs(os.path.dirname(full_path), exist_ok=True)
        with open(full_path, 'w') as f:
            f.write(content)
        return jsonify({"status": "success"})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/redeploy/<app_name>', methods=['POST'])
def redeploy_app(app_name):
    resolved_name = resolve_app_name(app_name)
    if not resolved_name:
         return jsonify({"error": f"App '{app_name}' not found"}), 404
         
    # Check for existing app configuration
    existing_app = models.get_app_by_name(resolved_name)
    port = existing_app['port'] if existing_app else None
    
    # For redeploy, we assume files are already in builds/app_name
    # We need to trigger a building process that skips ingestion
    task_id = str(uuid.uuid4())
    models.start_deployment(task_id, resolved_name)
    
    # We'll use a modified pipeline call or just bypass ingestion
    def run_redeploy_async():
        from core.pipeline import DeploymentPipeline
        # Re-use the port if it exists
        pipeline = DeploymentPipeline(task_id, None, resolved_name, port=port)
        # Manually trigger stages skipping ingestion
        pipeline.update_stage("Source Code Ingestion", "success", "Using existing source code.")
        
        try:
            if pipeline.stage_inspection() and \
               pipeline.stage_dockerfile() and \
               pipeline.stage_build() and \
               pipeline.stage_registry() and \
               pipeline.stage_execution():
                models.update_deployment(task_id, 'success', f"Redeployed successfully to port {pipeline.port}")
                if existing_app:
                    models.update_app(resolved_name, port=pipeline.port)
                else:
                    models.create_app(resolved_name, runtime=None, port=pipeline.port)
            else:
                 models.update_deployment(task_id, 'error', "Redeploy failed.")
        except Exception as e:
            models.update_deployment(task_id, 'error', str(e))

    executor.submit(run_redeploy_async)
    return jsonify({"status": "accepted", "task_id": task_id}), 202

@app.route('/api/containers', methods=['GET'])
def list_containers():
    """
    Lists running containers using docker ps.
    """
    try:
        # Run docker ps to get container info
        # Format: ID, Names, Image, Ports, Status
        cmd = ["docker", "ps", "--format", "{{.ID}}|{{.Names}}|{{.Image}}|{{.Ports}}|{{.Status}}"]
        output = subprocess.check_output(cmd).decode("utf-8").strip()
        
        containers = []
        if output:
            for line in output.split('\n'):
                parts = line.split('|')
                if len(parts) >= 5:
                    containers.append({
                        "id": parts[0],
                        "name": parts[1],
                        "image": parts[2],
                        "ports": parts[3],
                        "status": parts[4]
                    })
        
        return jsonify(containers)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/containers/<container_id>', methods=['DELETE'])
def delete_container(container_id):
    try:
        subprocess.run(["docker", "rm", "-f", container_id], check=True)
        return jsonify({"status": "success", "message": f"Container {container_id} removed"}), 200
    except subprocess.CalledProcessError as e:
        return jsonify({"status": "error", "message": str(e)}), 500

if __name__ == '__main__':
    models.init_db() # Ensure DB is initialized
    app.run(host='0.0.0.0', port=5000, debug=True)
