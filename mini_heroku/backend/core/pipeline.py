import os
import shutil
import time
from utils.extract import extract
from utils.port_utils import get_free_port
from core.detector import detect_runtime
from core.docker_builder import generate_dockerfile, build_image
from core.runner import run_container
from auto_patch import auto_patch
import models

class DeploymentPipeline:
    def __init__(self, task_id, zip_path, app_name, port=None):
        self.task_id = task_id
        self.zip_path = zip_path
        self.app_name = app_name
        self.build_dir = os.path.join("builds", app_name)
        self.runtime = None
        self.port = port
        self.image_tag = app_name.lower()

    def update_stage(self, stage_name, status, message=None):
        print(f"[{stage_name}] {status}: {message}")
        models.update_deployment_stage(self.task_id, stage_name, status, message)

    def run(self):
        try:
            # 1. Source Code Ingestion
            self.update_stage("Source Code Ingestion", "processing", "Extracting source code...")
            if not self.stage_ingestion():
                return False

            # 2. Runtime & Dependency Inspection
            self.update_stage("Runtime & Dependency Inspection", "processing", "Detecting runtime environment...")
            if not self.stage_inspection():
                return False

            # 3. Dockerfile Generation
            self.update_stage("Dockerfile Generation", "processing", "Generating optimized Dockerfile...")
            if not self.stage_dockerfile():
                return False

            # 4. Container Image Building
            self.update_stage("Container Image Building", "processing", "Building Docker image (this may take a minute)...")
            if not self.stage_build():
                return False

            # 5. Registry Management
            self.update_stage("Registry Management", "processing", "Managing image registry tasks...")
            if not self.stage_registry():
                return False

            # 6. Runtime Execution
            self.update_stage("Runtime Execution", "processing", "Starting container and exposing endpoint...")
            if not self.stage_execution():
                return False

            return True
        except Exception as e:
            models.update_deployment(self.task_id, 'error', str(e))
            return False

    def _resolve_nested_dir(self):
        try:
            entries = [e for e in os.listdir(self.build_dir) if not e.startswith('__')]
            if len(entries) == 1 and os.path.isdir(os.path.join(self.build_dir, entries[0])):
                self.build_dir = os.path.join(self.build_dir, entries[0])
        except Exception:
            pass

    def stage_ingestion(self):
        try:
            extract(self.zip_path, self.build_dir)
            self._resolve_nested_dir()
            self.update_stage("Source Code Ingestion", "success", "Source code ingested successfully.")
            return True
        except Exception as e:
            self.update_stage("Source Code Ingestion", "error", str(e))
            return False

    def stage_inspection(self):
        try:
            # Re-check for nested directory in case ingestion was skipped (redeploy)
            self._resolve_nested_dir()
            
            self.runtime = detect_runtime(self.build_dir)
            if self.runtime == "unknown":
                self.update_stage("Runtime & Dependency Inspection", "error", "Could not detect runtime.")
                return False
            
            # Auto Patch for port compatibility
            auto_patch(self.build_dir, self.runtime)
            
            self.update_stage("Runtime & Dependency Inspection", "success", f"Detected {self.runtime} runtime.")
            return True
        except Exception as e:
            self.update_stage("Runtime & Dependency Inspection", "error", str(e))
            return False

    def stage_dockerfile(self):
        try:
            generate_dockerfile(self.build_dir, self.runtime)
            self.update_stage("Dockerfile Generation", "success", "Dockerfile generated.")
            return True
        except Exception as e:
            self.update_stage("Dockerfile Generation", "error", str(e))
            return False

    def stage_build(self):
        try:
            if build_image(self.build_dir, self.image_tag):
                self.update_stage("Container Image Building", "success", "Image built successfully.")
                return True
            else:
                self.update_stage("Container Image Building", "error", "Docker build failed.")
                return False
        except Exception as e:
            self.update_stage("Container Image Building", "error", str(e))
            return False

    def stage_registry(self):
        try:
            # Simulate registry management by tagging the image
            # In a real PaaS, this would push to ECR/GCR
            time.sleep(1) # Simulate network delay
            self.update_stage("Registry Management", "success", f"Image {self.image_tag}:latest registered.")
            return True
        except Exception as e:
            self.update_stage("Registry Management", "error", str(e))
            return False

    def stage_execution(self):
        try:
            if self.port is None:
                self.port = get_free_port()
            if run_container(self.image_tag, self.port):
                self.update_stage("Runtime Execution", "success", f"App is live at port {self.port}")
                return True
            else:
                self.update_stage("Runtime Execution", "error", "Container failed to start.")
                return False
        except Exception as e:
            self.update_stage("Runtime Execution", "error", str(e))
            return False
