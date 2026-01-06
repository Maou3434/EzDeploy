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
    def progress_callback(msg):
        models.update_deployment(task_id, 'building', msg)

    try:
        models.update_deployment(task_id, 'building', 'Starting build...')
        result = deploy(filepath, status_callback=progress_callback)
        
        if result.get("status") == "success":
            models.update_deployment(task_id, 'success', f"Deployed successfully to port {result.get('port')}")
            # Ensure app exists in database
            models.create_app(app_name, runtime=None, port=result.get('port'))
        else:
            models.update_deployment(task_id, 'error', result.get("message", "Unknown build error"))
            
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
        
        # Initialize deployment tracking
        models.start_deployment(task_id, app_name)
        
        # Trigger deployment in background
        executor.submit(run_deployment_async, task_id, filepath, app_name)
        
        return jsonify({
            "status": "accepted",
            "task_id": task_id,
            "message": "Deployment started in background"
        }), 202

@app.route('/api/deploy/status/<task_id>', methods=['GET'])
def get_deployment_status(task_id):
    status = models.get_deployment(task_id)
    if not status:
        return jsonify({"error": "Task not found"}), 404
    return jsonify(status)

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
