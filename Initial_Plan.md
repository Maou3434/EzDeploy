# Mini Heroku – Cloud App Deployment Platform

## 1. Project Overview

**Mini Heroku** is a simplified cloud-native application deployment platform inspired by Heroku. It allows users to upload application source code, automatically containerize it, deploy it on cloud infrastructure, and expose it via a public URL.

The goal of this project is to demonstrate understanding of **cloud architecture, containerization, CI/CD concepts, orchestration, and deployment automation**, while keeping the scope manageable for a solo semester project.

---

## 2. Problem Statement

Deploying applications manually requires knowledge of infrastructure setup, containerization, networking, and scaling. Beginners often struggle with the complexity of deployment pipelines.

This project aims to abstract those complexities by building a platform that:
- Accepts application source code
- Automatically builds and deploys it
- Provides a live, accessible URL
- Tracks deployed applications and logs

---

## 3. System Architecture

### 3.1 High-Level Architecture Diagram

```
┌────────────┐
│   User     │
│  (Browser) │
└─────┬──────┘
      │ Upload ZIP / Request
      ▼
┌────────────┐
│ Frontend   │  (React / HTML)
└─────┬──────┘
      │ REST API Calls
      ▼
┌────────────┐
│ Backend API│  (Flask / FastAPI)
└─────┬──────┘
      │
      │ 1. Store source code
      ▼
┌────────────┐
│ Object     │  (S3 / GCS)
│ Storage    │
└─────┬──────┘
      │
      │ 2. Trigger build
      ▼
┌────────────┐
│ Build      │  (Docker Build)
│ Service    │
└─────┬──────┘
      │
      │ 3. Push image
      ▼
┌────────────┐
│ Container  │  (ECR / GCR)
│ Registry   │
└─────┬──────┘
      │
      │ 4. Deploy container
      ▼
┌────────────┐
│ Runtime    │  (EC2 / VM /
│ Environment│   ECS / Cloud Run)
└─────┬──────┘
      │
      │ Public Endpoint
      ▼
┌────────────┐
│  Deployed  │
│ Application│
└────────────┘
```

---

## 4. Architecture Explanation

### 4.1 Frontend
- Provides UI for uploading source code (ZIP)
- Displays deployment status and logs
- Shows deployed application URLs

### 4.2 Backend API
- Handles user requests
- Validates uploads
- Generates Dockerfile (if not present)
- Orchestrates build and deployment steps

### 4.3 Object Storage
- Temporarily stores uploaded source code
- Acts as input for the build stage

### 4.4 Build Service
- Pulls source code from storage
- Builds Docker image
- Streams build logs back to backend

### 4.5 Container Registry
- Stores built Docker images
- Versioned image management

### 4.6 Runtime Environment
- Runs deployed containers
- Assigns public ports / URLs
- Manages container lifecycle

---

## 5. Tech Stack

### Cloud Platform
- **AWS** (recommended)
  - EC2
  - S3
  - ECR
  - IAM

*(GCP or Azure equivalents can be used)*

### Backend
- Python
- Flask or FastAPI
- Docker SDK / subprocess calls

### Frontend
- React (preferred) or plain HTML + JS
- Axios / Fetch API

### Containerization
- Docker
- Dockerfiles (auto-generated)

### Database (Metadata)
- SQLite (local) or DynamoDB
- Stores:
  - App name
  - Image tag
  - Deployment status
  - Public URL

### DevOps / Tools
- Docker CLI
- Git
- Linux

---

## 6. Application Flow (Step-by-Step)

1. User uploads application ZIP
2. Backend validates structure
3. Source code stored in object storage
4. Backend generates Dockerfile
5. Docker image is built
6. Image pushed to container registry
7. Runtime pulls image
8. Container started on VM
9. Public URL returned to user

---

## 7. Assumptions & Constraints

- Supports **only one runtime initially** (Python Flask)
- No authentication (single-user system)
- No autoscaling (manual scaling only)
- One container per application

These constraints keep the project realistic and solo-manageable.

---

## 8. Milestones & Timeline

### Milestone 1: Project Setup (Week 1)
- Finalize architecture
- Setup cloud account
- Configure IAM and VM
- Install Docker

### Milestone 2: Backend API (Week 1–2)
- File upload API
- Metadata storage
- Build trigger logic

### Milestone 3: Container Build Pipeline (Week 2)
- Dockerfile generation
- Image build
- Push to registry
- Capture build logs

### Milestone 4: Deployment Engine (Week 3)
- Pull image from registry
- Run container on VM
- Expose public port

### Milestone 5: Frontend UI (Week 3)
- Upload interface
- Deployment status
- Display app URL

### Milestone 6: Testing & Demo (Week 4)
- Deploy sample apps
- Failure handling
- Documentation and screenshots

---

## 9. Minimal Viable Implementation (MVP)

- Upload ZIP
- Build Docker image
- Run container on EC2
- Return public URL

This alone is sufficient for evaluation.

---

## 10. Optional Enhancements

- Multiple runtime support (Node.js)
- GitHub repo integration
- Build cache
- Container stop/restart
- Deployment history
- Basic authentication

---

## 11. Learning Outcomes

- Cloud architecture design
- Containerization concepts
- CI/CD fundamentals
- Deployment automation
- Practical DevOps exposure

---

## 12. Conclusion

This project balances **technical depth and feasibility**, making it ideal for a solo semester project while showcasing real-world cloud engineering skills.

