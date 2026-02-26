import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiServer, FiTrash2, FiActivity, FiExternalLink, FiCode, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';
import Editor from './components/Editor';

function App() {
  const [containers, setContainers] = useState([]);
  const [deploying, setDeploying] = useState(false);
  const [deploymentData, setDeploymentData] = useState(null);
  const [dragActive, setDragActive] = useState(false);
  const [activeTaskId, setActiveTaskId] = useState(null);
  const [editingApp, setEditingApp] = useState(null);
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

  const getStageIcon = (status) => {
    if (status === 'success') return <FiCheckCircle color="var(--success)" />;
    if (status === 'processing') return <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}><FiActivity color="var(--primary)" /></motion.div>;
    if (status === 'error') return <FiAlertCircle color="var(--danger)" />;
    return <FiClock color="#555" />;
  };

  return (
    <div className="app-container" style={{ padding: '40px', maxWidth: '1200px', margin: '0 auto' }}>

      {/* Header */}
      <header style={{ marginBottom: '60px', textAlign: 'center' }}>
        <motion.h1 className="glow-text" initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} style={{ fontSize: '3.5rem', marginBottom: '10px', letterSpacing: '4px' }}>
          EZDEPLOY
        </motion.h1>
        <p style={{ color: 'var(--text-muted)', fontSize: '1.2rem' }}>
          Transparent Iterative PaaS Framework
        </p>
      </header>

      {/* Main Content Area */}
      {!deploying && (
        <motion.div
          className={`glass-panel upload-zone ${dragActive ? 'drag-active' : ''}`}
          onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
          onClick={() => fileInputRef.current.click()}
          whileHover={{ scale: 1.01 }}
        >
          <input ref={fileInputRef} type="file" className="input-file" accept=".zip" onChange={handleFileChange} />
          <FiUploadCloud size={48} color="var(--primary)" style={{ marginBottom: '16px' }} />
          <h3>Push New Application</h3>
          <p style={{ color: 'var(--text-muted)' }}>Drag & Drop ZIP or click to browse</p>
        </motion.div>
      )}

      {/* Pipeline Progress */}
      <AnimatePresence>
        {deploying && (
          <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass-panel" style={{ padding: '40px', marginBottom: '32px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
              <h2 style={{ margin: 0 }}>Deployment Pipeline</h2>
              <div className="status-badge status-up">MISSION: {deploymentData?.app_name || 'INITIALIZING'}</div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px' }}>
              {deploymentData?.stages?.map((stage, idx) => (
                <div key={idx} className="stage-item" style={{ border: stage.status === 'processing' ? '1px solid var(--primary)' : '1px solid transparent' }}>
                  <div style={{ marginRight: '10px' }}>{getStageIcon(stage.status)}</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 'bold' }}>{stage.stage_name}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-white)', opacity: 0.7 }}>{stage.message || 'Pending...'}</div>
                  </div>
                </div>
              ))}
              {!deploymentData && <p>Preparing environments...</p>}
            </div>

            {deploymentData?.status === 'error' && (
              <div style={{ marginTop: '20px', padding: '15px', background: 'rgba(255,0,85,0.1)', borderRadius: '8px', border: '1px solid var(--danger)' }}>
                <strong color="var(--danger)">Error:</strong> {deploymentData.message}
                <button onClick={() => setDeploying(false)} style={{ marginLeft: '20px' }}>Dismiss</button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Dashboard Grid */}
      <div className="container-grid">
        <AnimatePresence>
          {containers.map(container => (
            <motion.div key={container.id} className="glass-panel" initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.9 }} style={{ padding: '24px', position: 'relative' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '4px', height: '100%', background: container.status.startsWith('Up') ? 'var(--success)' : 'var(--danger)' }}></div>

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
                <h2 style={{ margin: 0, fontSize: '1.4rem' }}>{container.name}</h2>
                <div className={`status-badge ${container.status.startsWith('Up') ? 'status-up' : 'status-exited'}`}>
                  {container.status.startsWith('Up') ? 'LIVE' : 'DOWN'}
                </div>
              </div>

              <div style={{ marginBottom: '20px', color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}><FiServer /> {container.image}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><FiActivity /> {container.ports || 'No ports'}</div>
              </div>

              <div style={{ display: 'flex', gap: '10px' }}>
                {container.ports && (
                  <a href={`http://localhost:${container.ports.split('->')[0].split(':')[1]}`} target="_blank" rel="noreferrer" className="btn-primary" style={{ textDecoration: 'none', flex: 1, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem' }}>
                    <FiExternalLink /> Open
                  </a>
                )}
                <button className="btn-primary" style={{ background: 'rgba(255,255,255,0.1)', flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.9rem' }} onClick={() => setEditingApp(container.name)}>
                  <FiCode /> Edit
                </button>
                <button className="btn-danger" onClick={() => deleteContainer(container.id)}><FiTrash2 size={18} /></button>
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

      {editingApp && <Editor appName={editingApp} onClose={() => setEditingApp(null)} onRedeploy={handleRedeploy} />}

    </div>
  );
}

export default App;
