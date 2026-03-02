import React, { useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiUploadCloud, FiActivity, FiCheckCircle, FiClock, FiAlertCircle } from 'react-icons/fi';

const DeployPage = ({
    deploying,
    deploymentData,
    dragActive,
    handleDrag,
    handleDrop,
    handleFileChange,
    setDeploying
}) => {
    const fileInputRef = useRef(null);

    const getStageIcon = (status) => {
        if (status === 'success') return <FiCheckCircle color="var(--success)" />;
        if (status === 'processing') return <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 2 }}><FiActivity color="var(--primary)" /></motion.div>;
        if (status === 'error') return <FiAlertCircle color="var(--danger)" />;
        return <FiClock color="var(--text-dim)" />;
    };

    return (
        <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px' }}>
            <header style={{ marginBottom: '60px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Deploy New <span className="glow-text">Application</span></h1>
                <p style={{ color: 'var(--text-dim)' }}>Push your code to the edge. Zip your project and drop it here.</p>
            </header>

            {!deploying && (
                <motion.div
                    className={`glass upload-zone ${dragActive ? 'drag-active' : ''}`}
                    onDragEnter={handleDrag} onDragLeave={handleDrag} onDragOver={handleDrag} onDrop={handleDrop}
                    onClick={() => fileInputRef.current.click()}
                    whileHover={{ scale: 1.01 }}
                    style={{ padding: '80px 40px', borderStyle: 'dashed' }}
                >
                    <input ref={fileInputRef} type="file" className="input-file" accept=".zip" onChange={handleFileChange} />
                    <div style={{
                        width: '80px',
                        height: '80px',
                        borderRadius: '20px',
                        background: 'rgba(0, 242, 255, 0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        margin: '0 auto 24px',
                        color: 'var(--primary)',
                        border: '1px solid rgba(0, 242, 255, 0.1)'
                    }}>
                        <FiUploadCloud size={40} />
                    </div>
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '8px' }}>Pushover to Deploy</h3>
                    <p style={{ color: 'var(--text-dim)' }}>Drag & Drop ZIP or click to browse files</p>
                </motion.div>
            )}

            <AnimatePresence>
                {deploying && (
                    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass" style={{ padding: '40px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px' }}>
                            <div>
                                <h2 style={{ fontSize: '1.8rem', marginBottom: '4px' }}>Deployment Pipeline</h2>
                                <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem' }}>Tracking build and orchestration stages</p>
                            </div>
                            <div style={{
                                padding: '6px 16px',
                                borderRadius: '8px',
                                background: 'rgba(0, 255, 163, 0.1)',
                                color: 'var(--success)',
                                fontSize: '0.8rem',
                                fontWeight: 700,
                                border: '1px solid rgba(0, 255, 163, 0.2)'
                            }}>
                                {deploymentData?.app_name?.toUpperCase() || 'INITIALIZING...'}
                            </div>
                        </div>

                        <div style={{ display: 'grid', gap: '16px' }}>
                            {deploymentData?.stages?.map((stage, idx) => (
                                <div key={idx} className="glass" style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '20px',
                                    padding: '20px',
                                    background: stage.status === 'processing' ? 'rgba(0, 242, 255, 0.03)' : 'rgba(255, 255, 255, 0.02)',
                                    borderColor: stage.status === 'processing' ? 'rgba(0, 242, 255, 0.2)' : 'var(--glass-border)'
                                }}>
                                    <div style={{ fontSize: '1.5rem' }}>{getStageIcon(stage.status)}</div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, fontSize: '1rem', marginBottom: '2px' }}>{stage.stage_name}</div>
                                        <div style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>{stage.message || 'Waiting for previous stage...'}</div>
                                    </div>
                                    {stage.status === 'processing' && (
                                        <motion.div
                                            animate={{ opacity: [0.4, 1, 0.4] }}
                                            transition={{ duration: 1.5, repeat: Infinity }}
                                            style={{ height: '4px', width: '60px', borderRadius: '2px', background: 'var(--primary)' }}
                                        />
                                    )}
                                </div>
                            ))}
                            {!deploymentData && <p style={{ textAlign: 'center', padding: '20px', color: 'var(--text-dim)' }}>Initializing build environment...</p>}
                        </div>

                        {deploymentData?.status === 'error' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                style={{
                                    marginTop: '30px',
                                    padding: '20px',
                                    background: 'rgba(255, 0, 85, 0.05)',
                                    borderRadius: '12px',
                                    border: '1px solid rgba(255, 0, 85, 0.2)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'space-between'
                                }}
                            >
                                <div style={{ color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: '12px' }}>
                                    <FiAlertCircle size={20} />
                                    <span><strong>Deployment failed:</strong> {deploymentData.message}</span>
                                </div>
                                <button onClick={() => setDeploying(false)} className="btn btn-outline" style={{ padding: '8px 20px', fontSize: '0.85rem' }}>Dismiss</button>
                            </motion.div>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default DeployPage;
