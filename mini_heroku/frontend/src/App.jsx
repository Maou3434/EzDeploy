import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { AnimatePresence } from 'framer-motion';

// Components & Pages
import Layout from './components/Layout';
import LandingPage from './pages/LandingPage';
import DeployPage from './pages/DeployPage';
import DashboardPage from './pages/DashboardPage';
import EditorPage from './pages/EditorPage';
import CustomCursor from './components/CustomCursor';
import AIBuddy from './components/AIBuddy';

function App() {
  const [containers, setContainers] = useState([]);
  const [deploying, setDeploying] = useState(false);
  const [deploymentData, setDeploymentData] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [editingApp, setEditingApp] = useState(null);

  // Fetch containers loop
  useEffect(() => {
    fetchContainers();
    const interval = setInterval(fetchContainers, 5000);
    return () => clearInterval(interval);
  }, []);

  // Deployment polling loop
  useEffect(() => {
    let pollInterval;
    if (activeTaskId) {
      pollInterval = setInterval(async () => {
        try {
          const res = await axios.get(`/api/deploy/status/${activeTaskId}`);
          setDeploymentData(res.data);

          if (res.data.status === 'success') {
            setActiveTaskId(null);
            setDeploying(false);
            fetchContainers();
          } else if (res.data.status === 'error') {
            setActiveTaskId(null);
            setDeploying(false);
          }
        } catch (err) {
          console.error("Polling error:", err);
          setActiveTaskId(null);
          setDeploying(false);
        }
      }, 1500);
    }
    return () => clearInterval(pollInterval);
  }, [activeTaskId]);

  const fetchContainers = async () => {
    try {
      const res = await axios.get('/api/containers');
      setContainers(res.data);
    } catch (err) {
      console.error("Error fetching containers:", err);
    }
  };

  const handleDrag = (e) => {
    e.preventDefault(); e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") setDragActive(true);
    else if (e.type === "dragleave") setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault(); e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) handleUpload(e.dataTransfer.files[0]);
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) handleUpload(e.target.files[0]);
  };

  const handleUpload = async (file) => {
    setDeploying(true);
    setDeploymentData(null);

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/deploy', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setActiveTaskId(res.data.task_id);
    } catch (err) {
      console.error(err);
      setDeploying(false);
    }
  };

  const handleRedeploy = async (appName) => {
    setDeploying(true);
    setDeploymentData(null);
    setEditingApp(null);
    try {
      const res = await axios.post(`/api/redeploy/${appName}`);
      setActiveTaskId(res.data.task_id);
    } catch (err) {
      console.error(err);
      setDeploying(false);
    }
  };

  const deleteContainer = async (id) => {
    if (!window.confirm("Are you sure you want to stop this container?")) return;
    try {
      await axios.delete(`/api/containers/${id}`);
      fetchContainers();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/deploy" element={
            <DeployPage
              deploying={deploying}
              deploymentData={deploymentData}
              dragActive={dragActive}
              handleDrag={handleDrag}
              handleDrop={handleDrop}
              handleFileChange={handleFileChange}
              setDeploying={setDeploying}
            />
          } />
          <Route path="/dashboard" element={
            <DashboardPage
              containers={containers}
              deleteContainer={deleteContainer}
            />
          } />
          <Route path="/editor/:appName" element={
            <EditorPage onRedeploy={handleRedeploy} />
          } />
          {/* Redirect any unknown path to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>

      <AIBuddy context={deploymentData?.message} />
      <CustomCursor />
    </BrowserRouter>
  );
}

export default App;
