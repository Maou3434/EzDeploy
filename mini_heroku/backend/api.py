import os
import sys
import subprocess
from flask import Flask, request, jsonify
from flask_cors import CORS
from werkzeug.utils import secure_filename

# Add parent directory to path to import core modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from deploy import deploy

app = Flask(__name__)
CORS(app) # Allow Cross-Origin requests for React frontend

UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.dirname(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

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
        
        # Trigger deployment
        result = deploy(filepath)
        status_code = 200 if result.get("status") == "success" else 500
        return jsonify(result), status_code

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
    app.run(host='0.0.0.0', port=5000, debug=True)
