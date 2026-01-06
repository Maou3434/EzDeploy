import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiServer, FiTrash2, FiActivity, FiExternalLink } from 'react-icons/fi';

function App() {
  const [containers, setContainers] = useState([]);
  const [deploying, setDeploying] = useState(false);
  const [uploadStatus, setUploadStatus] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const fileInputRef = useRef(null);

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
          const { status, message } = res.data;

          if (status === 'success') {
            setUploadStatus(`Success! ${message}`);
            setActiveTaskId(null);
            setDeploying(false);
            fetchContainers();
            setTimeout(() => setUploadStatus(null), 8000);
          } else if (status === 'error') {
            setUploadStatus(`Error: ${message}`);
            setActiveTaskId(null);
            setDeploying(false);
            setTimeout(() => setUploadStatus(null), 8000);
          } else {
            setUploadStatus(message || "Building...");
          }
        } catch (err) {
          console.error("Polling error:", err);
          setActiveTaskId(null);
          setDeploying(false);
          setUploadStatus("Lost connection to deployment task.");
        }
      }, 2000);
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
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleUpload(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleUpload(e.target.files[0]);
    }
  };

  const handleUpload = async (file) => {
    setDeploying(true);
    setUploadStatus("Uploading ZIP...");

    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await axios.post('/api/deploy', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      if (res.status === 202) {
        setActiveTaskId(res.data.task_id);
        setUploadStatus("Deployment started...");
      } else {
        // Fallback for immediate success
        setUploadStatus(`Success! App running on port ${res.data.port}`);
        fetchContainers();
        setDeploying(false);
        setTimeout(() => setUploadStatus(null), 5000);
      }
    } catch (err) {
      console.error(err);
      setUploadStatus("Cloud upload failed.");
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
    <div className="app-container" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <header style={{ marginBottom: '60px', textAlign: 'center' }}>
        <motion.h1
          className="glow-text"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          style={{ fontSize: '3.5rem', marginBottom: '10px' }}
        >
          MINI HEROKU
        </motion.h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
          Next-Gen Cloud Orchestration
        </p>
      </header>

      {/* Upload Zone */}
      <motion.div
        className={`glass-panel upload-zone ${dragActive ? 'drag-active' : ''}`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current.click()}
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.98 }}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="input-file"
          accept=".zip"
          onChange={handleFileChange}
        />
        {deploying ? (
          <div style={{ padding: '20px' }}>
            <div className="spinner" style={{ fontSize: '2rem', marginBottom: '10px' }}>⚡</div>
            <h3>{uploadStatus}</h3>
          </div>
        ) : (
          <div>
            <FiUploadCloud size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
            <h3>Drag & Drop Application ZIP</h3>
            <p style={{ color: 'var(--text-muted)' }}>or click to browse</p>
          </div>
        )}
      </motion.div>

      {/* Dashboard Grid */}
      <div className="container-grid">
        <AnimatePresence>
          {containers.map(container => (
            <motion.div
              key={container.id}
              className="glass-panel"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.2 }}
              style={{ padding: '24px', position: 'relative', overflow: 'hidden' }}
            >
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: container.status.startsWith('Up') ? 'var(--success)' : 'var(--danger)' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{container.name}</h2>
                <div className={`status-badge ${container.status.startsWith('Up') ? 'status-up' : 'status-exited'}`}>
                  {container.status.startsWith('Up') ? 'RUNNING' : 'STOPPED'}
                </div>
              </div>

              <div style={{ marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <FiServer /> {container.image}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FiActivity /> {container.ports || 'No ports exposed'}
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                {container.ports && (
                  <a
                    href={`http://localhost:${container.ports.split('->')[0].split(':')[1]}`}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-primary"
                    style={{ textDecoration: 'none', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}
                  >
                    <FiExternalLink /> Open App
                  </a>
                )}
                <button
                  className="btn-danger"
                  onClick={() => deleteContainer(container.id)}
                  title="Stop Container"
                >
                  <FiTrash2 size={20} />
                </button>
              </div>

            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {containers.length === 0 && !deploying && (
        <div style={{ textAlign: 'center', marginTop: '60px', opacity: 0.5 }}>
          <p>No active deployments. Upload a ZIP to start.</p>
        </div>
      )}

    </div>
  );
}

export default App;
