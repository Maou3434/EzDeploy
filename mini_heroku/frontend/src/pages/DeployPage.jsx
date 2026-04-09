import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiCheckCircle, FiXCircle, FiLoader, FiTerminal, FiZap, FiAlertTriangle, FiArrowLeft } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import WarpDrive from '../components/WarpDrive';
import { runFieldTriage } from '../services/OllamaService';

const DeployPage = ({ 
    deploying,
    deploymentData,
    dragActive,
    handleDrag,
    handleDrop,
    handleFileChange,
    setDeploying
}) => {
    const navigate = useNavigate();
    const [triageReport, setTriageReport] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);

    const stages = [
        { id: 'upload', label: 'CARGO UPLOAD', icon: <FiLoader /> },
        { id: 'build', label: 'CONSTRUCTING IMAGE', icon: <FiLoader /> },
        { id: 'push', label: 'ORBITAL PUSH', icon: <FiLoader /> },
        { id: 'deploy', label: 'SYSTEM ACTIVATION', icon: <FiLoader /> }
    ];

    useEffect(() => {
        if (deploymentData && deploymentData.status === 'error') {
            handleTriage();
        }
    }, [deploymentData]);

    const handleTriage = async () => {
        setAnalyzing(true);
        try {
            const logs = deploymentData.message || "No error logs available.";
            const report = await runFieldTriage(deploymentData.app_name || "Unknown", logs);
            setTriageReport(report);
        } catch (err) {
            console.error(err);
        }
        setAnalyzing(false);
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px', position: 'relative' }}>
            {deploying && <WarpDrive />}

            <header style={{ marginBottom: '60px', textAlign: deploying ? 'center' : 'left' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>
                    {deploying ? 'Deploying ' : 'New '} 
                    <span className="glow-text">Application</span>
                </h1>
                <p style={{ color: 'var(--text-dim)' }}>
                    {deploying ? 'Initializing cloud resources and build pipeline.' : 'Deploy your application source code. Zip your project and upload it below.'}
                </p>
            </header>

            {!deploying ? (
                <motion.div
                    className="glass beveled upload-zone"
                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                    whileHover={{ scale: 1.01 }}
                    style={{ padding: '100px 40px', borderStyle: 'dashed', textAlign: 'center', cursor: 'pointer' }}
                    onClick={() => document.getElementById('file-upload').click()}
                >
                    <input
                        id="file-upload"
                        type="file"
                        className="input-file"
                        accept=".zip"
                        onChange={handleFileChange}
                        style={{ display: 'none' }}
                    />
                    <div style={{
                        width: '80px',
                        height: '80px',
                        background: 'rgba(0, 242, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        color: 'var(--primary)',
                        border: '1px solid rgba(0, 242, 255, 0.2)',
                        clipPath: 'polygon(15% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%, 0% 15%)'
                    }}>
                        <FiTerminal size={40} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>START DEPLOYMENT</h3>
                    <p style={{ color: 'var(--text-dim)', marginBottom: '30px' }}>Drag & Drop .ZIP or click to select project files</p>
                    <div className="btn btn-outline" style={{ pointerEvents: 'none' }}>
                        Browse Local Files
                    </div>
                </motion.div>
            ) : (
                <div className="glass beveled" style={{ padding: '40px', position: 'relative', zIndex: 1, border: deploymentData?.status === 'error' ? '2px solid var(--danger)' : '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                        <div>
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>PIPELINE STATUS</h2>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.8rem', fontFamily: 'Outfit' }}>MONITORING STAGES</p>
                        </div>
                        <div style={{
                            padding: '6px 16px',
                            background: deploymentData?.status === 'error' ? 'rgba(255, 0, 85, 0.1)' : 'rgba(0, 255, 163, 0.1)',
                            color: deploymentData?.status === 'error' ? 'var(--danger)' : 'var(--success)',
                            fontSize: '0.75rem',
                            fontWeight: 700,
                            border: `1px solid ${deploymentData?.status === 'error' ? 'var(--danger)' : 'var(--success)'}`
                        }}>
                            {deploymentData?.app_name?.toUpperCase() || 'SYNCHRONIZING...'}
                        </div>
                    </div>

                    <div style={{ display: 'grid', gap: '16px', maxWidth: '700px', margin: '0 auto 40px' }}>
                        {deploymentData?.stages?.map((stage, idx) => {
                            const isFailed = stage.status === 'error';
                            const isProcessing = stage.status === 'processing';
                            const isSuccess = stage.status === 'success';

                            return (
                                <motion.div 
                                    key={idx} 
                                    initial={{ x: -20, opacity: 0 }}
                                    animate={{ x: 0, opacity: 1 }}
                                    className="glass" 
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: '20px',
                                        padding: '16px 24px',
                                        background: isProcessing ? 'rgba(0, 242, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)',
                                        borderColor: isProcessing ? 'var(--primary)' : isFailed ? 'var(--danger)' : 'var(--glass-border)',
                                        borderLeft: `3px solid ${isProcessing ? 'var(--primary)' : isFailed ? 'var(--danger)' : isSuccess ? 'var(--success)' : 'transparent'}`
                                    }}
                                >
                                    <div style={{ fontSize: '1.2rem', color: isSuccess ? 'var(--success)' : isFailed ? 'var(--danger)' : 'var(--primary)' }}>
                                        {isSuccess ? <FiCheckCircle /> : isFailed ? <FiXCircle /> : <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}><FiLoader /></motion.div>}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '2px' }}>{stage.stage_name}</div>
                                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>{stage.message || 'Waiting to start...'}</div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>

                    <AnimatePresence>
                        {deploymentData?.status === 'error' && triageReport && (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="glass beveled"
                                style={{
                                    padding: '24px',
                                    background: 'rgba(255, 0, 85, 0.05)',
                                    border: '1px solid var(--danger)',
                                    marginTop: '20px'
                                }}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '15px', color: 'var(--danger)' }}>
                                    <FiZap />
                                    <h3 style={{ fontSize: '0.9rem', fontWeight: 700 }}>AI ERROR DIAGNOSTIC REPORT</h3>
                                </div>
                                <div style={{ fontSize: '0.85rem', lineHeight: 1.6, color: '#e2e2ee', background: 'rgba(0,0,0,0.3)', padding: '15px' }}>
                                    {analyzing ? "Generating diagnostic report..." : triageReport}
                                </div>
                                <div style={{ marginTop: '20px', display: 'flex', gap: '10px' }}>
                                    <button className="btn btn-primary" style={{ background: 'var(--danger)', borderColor: 'var(--danger)', fontSize: '0.75rem' }} onClick={() => navigate(`/editor/${deploymentData.app_name}`)}>
                                        Resolve in Code Editor
                                    </button>
                                    <button className="btn btn-outline" style={{ fontSize: '0.75rem' }} onClick={() => setDeploying(false)}>
                                        Abort Pipeline
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {deploymentData?.status === 'success' && (
                        <div style={{ textAlign: 'center', marginTop: '40px' }}>
                            <FiCheckCircle size={48} color="var(--success)" style={{ marginBottom: '15px' }} />
                            <h2 style={{ fontSize: '1.5rem', marginBottom: '20px' }}>MISSION ACCOMPLISHED</h2>
                            <button className="btn btn-primary" onClick={() => navigate('/dashboard')}>
                                RETURN TO COMMAND
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default DeployPage;
