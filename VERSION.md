# Version History

All notable changes to this project will be documented in this file.

## [1.0.0] - 2026-01-06
### Changed
- **Project Structure**: Consolidated core logic (`core/`, `utils/`, `dockerfiles/`, `deploy.py`, `auto_patch.py`) into the `backend/` directory for better encapsulation.
- **Backend Updates**: Refactored `api.py` to use local module imports and relative paths for uploads and builds.
### Fixed
- **Configuration**: Updated `.gitignore` with comprehensive rules for Python, Node.js, and project-specific temporary files.
### Removed
- **Redundant Files**: Deleted `test_patcher.py` and legacy root `uploads/`/`builds/` directories.

## [0.3.0] - 2026-01-05
### Added
- **Dashboard UI**: Modern "Cyber-Glass" React application for managing deployments.
- **Backend API**: Flask-based REST API (`backend/api.py`) exposing deployment endpoints.
- **Container Management**: Real-time listing and deletion of containers from the UI.
- **Visual Design**: High-end glassmorphism aesthetic with drag-and-drop upload.

## [0.2.0] - 2026-01-05
### Added
- **Deployment Pipeline**: Full orchestration from ZIP file to running container.
- **Docker Integration**: Automated Dockerfile generation, image building, and container running.
- **Runtime Support**: Dockerfile templates for Python (Flask) and Node.js.
- **CLI Tool**: `deploy.py` script for easy deployment.
- **Auto-Patching Fixes**: Improved robustness of Flask patcher.

## [0.1.0] - 2026-01-05
### Added
- Core implementation of `mini_heroku`.
- Runtime detection for Python (Flask, Django) and Node.js.
- Automated patching system for port-environment compliance.
- Support for `requirements.txt` and `package.json` detection.

## [0.0.0] - 2025-12-14
### Added
- Initial project setup.
- Project overview and architecture definition in `Initial_Plan.md`.
- Milestone definitions and technology stack selection.
