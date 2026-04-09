import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiSave, FiX, FiFile, FiPlay, FiChevronRight, FiCode, FiActivity, FiArrowLeft, FiPlusCircle, FiCheckCircle, FiTrash2, FiLock, FiEye, FiEyeOff } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { runDiagnostics } from '../services/OllamaService';

const EditorPage = ({ onRedeploy }) => {
    const { appName } = useParams();
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [medicReport, setMedicReport] = useState(null);
    const [analyzing, setAnalyzing] = useState(false);
    const [activeTab, setActiveTab] = useState('code'); // 'code', 'config'
    const [secrets, setSecrets] = useState({});
    const [newSecret, setNewSecret] = useState({ key: '', value: '' });
    const [revealedSecrets, setRevealedSecrets] = useState(new Set());

    const autoScanTimer = useRef(null);

    useEffect(() => {
        fetchFiles();
    }, [appName]);

    useEffect(() => {
        if (activeTab === 'config') {
            fetchSecrets();
        }
    }, [activeTab, appName]);

    // Auto-scan logic (Medic)
    useEffect(() => {
        if (content && selectedFile) {
            if (autoScanTimer.current) clearTimeout(autoScanTimer.current);
            autoScanTimer.current = setTimeout(() => {
                handleSanityCheck(true); // Silent background check
            }, 5000);
        }
        return () => clearTimeout(autoScanTimer.current);
    }, [content]);

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/files/${appName}`);
            setFiles(res.data);
            if (res.data.length > 0) {
                loadFile(res.data[0]);
            }
        } catch (err) {
            console.error("Error fetching files:", err);
        }
        setLoading(false);
    };

    const fetchSecrets = async () => {
        try {
            const res = await axios.get(`/api/apps/${appName}/secrets`);
            setSecrets(res.data);
        } catch (err) {
            console.error("Error fetching secrets:", err);
        }
    };

    const loadFile = async (path) => {
        setSelectedFile(path);
        setMedicReport(null);
        try {
            const res = await axios.get(`/api/files/${appName}/read?path=${path}`);
            setContent(res.data.content);
        } catch (err) {
            console.error("Error loading file:", err);
        }
    };

    const handleSanityCheck = async (silent = false) => {
        if (!content || !selectedFile) return;
        if (!silent) setAnalyzing(true);
        try {
            const report = await runDiagnostics(selectedFile, content);
            setMedicReport(report);
        } catch (err) {
            console.error(err);
        }
        setAnalyzing(false);
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post(`/api/files/${appName}/write`, {
                path: selectedFile,
                content: content
            });
        } catch (err) {
            console.error("Error saving file:", err);
        }
        setSaving(false);
    };

    const handleAddSecret = async () => {
        if (!newSecret.key || !newSecret.value) return;
        try {
            await axios.post(`/api/apps/${appName}/secrets`, newSecret);
            setNewSecret({ key: '', value: '' });
            fetchSecrets();
        } catch (err) {
            console.error(err);
        }
    };

    const handleDeleteSecret = async (key) => {
        try {
            await axios.delete(`/api/apps/${appName}/secrets/${key}`);
            fetchSecrets();
        } catch (err) {
            console.error(err);
        }
    };

    const toggleSecretReveal = (key) => {
        const next = new Set(revealedSecrets);
        if (next.has(key)) next.delete(key);
        else next.add(key);
        setRevealedSecrets(next);
    };

    const handleRedeploy = async () => {
        if (onRedeploy) {
            await onRedeploy(appName);
            navigate('/dashboard');
        }
    };

    return (
        <div style={{ height: 'calc(100vh - 140px)', display: 'flex', flexDirection: 'column' }}>
            <header style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '24px',
                padding: '0 10px'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
                    <button
                        onClick={() => navigate('/dashboard')}
                        style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid var(--glass-border)',
                            color: 'white',
                            padding: '10px',
                            cursor: 'pointer',
                            display: 'flex'
                        }}
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Editor: <span className="glow-text">{appName}</span></h1>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Outfit' }}>
                            {activeTab === 'code' ? <>FILES <FiChevronRight size={12} /> {selectedFile}</> : <>CONFIGURATION <FiChevronRight size={12} /> SECRETS</>}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="glass" style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '12px', marginRight: '20px' }}>
                        <button 
                            onClick={() => setActiveTab('code')}
                            style={{ 
                                padding: '8px 16px', 
                                borderRadius: '8px',
                                border: 'none', 
                                background: activeTab === 'code' ? 'var(--primary)' : 'transparent', 
                                color: activeTab === 'code' ? '#000' : 'white', 
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            CODE
                        </button>
                        <button 
                            onClick={() => setActiveTab('config')}
                            style={{ 
                                padding: '8px 16px', 
                                borderRadius: '8px',
                                border: 'none', 
                                background: activeTab === 'config' ? 'var(--primary)' : 'transparent', 
                                color: activeTab === 'config' ? '#000' : 'white', 
                                fontSize: '0.75rem',
                                fontWeight: 700,
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            CONFIG
                        </button>
                    </div>

                    {activeTab === 'code' && (
                        <>
                            <button className="btn btn-outline" onClick={() => handleSanityCheck()} disabled={analyzing}>
                                <FiPlusCircle color={medicReport ? 'var(--primary)' : 'inherit'} /> {analyzing ? 'DIAGNOSING...' : 'AI DIAGNOSTIC'}
                            </button>
                            <button className="btn btn-outline" onClick={handleSave} disabled={saving}>
                                <FiSave /> {saving ? 'SAVING...' : 'SAVE'}
                            </button>
                        </>
                    )}
                    <button className="btn btn-primary" onClick={handleRedeploy}>
                        <FiPlay /> REDEPLOY
                    </button>
                </div>
            </header>

            <div className="glass beveled" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {activeTab === 'code' ? (
                    <>
                        <div style={{
                            width: '260px',
                            borderRight: '1px solid var(--glass-border)',
                            display: 'flex',
                            flexDirection: 'column',
                            background: 'rgba(0, 0, 0, 0.1)'
                        }}>
                            <div className="file-list" style={{ padding: '12px', overflowY: 'auto' }}>
                                {files.map(file => (
                                    <div
                                        key={file}
                                        style={{
                                            padding: '10px 12px',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '10px',
                                            fontSize: '0.85rem',
                                            transition: 'all 0.2s',
                                            color: selectedFile === file ? 'var(--primary)' : 'var(--text-dim)',
                                            background: selectedFile === file ? 'rgba(0, 242, 255, 0.05)' : 'transparent',
                                            borderLeft: selectedFile === file ? '2px solid var(--primary)' : '2px solid transparent',
                                            marginBottom: '4px',
                                            fontFamily: 'Outfit'
                                        }}
                                        onClick={() => loadFile(file)}
                                    >
                                        <FiFile size={14} />
                                        {file}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div style={{ flex: 1, display: 'flex', position: 'relative' }}>
                            <textarea
                                style={{
                                    flex: 1,
                                    background: 'transparent',
                                    border: 'none',
                                    color: '#e2e2ee',
                                    padding: '30px',
                                    fontFamily: "'JetBrains Mono', monospace",
                                    fontSize: '0.9rem',
                                    lineHeight: '1.6',
                                    resize: 'none',
                                    outline: 'none'
                                }}
                                value={content}
                                onChange={(e) => setContent(e.target.value)}
                                spellCheck="false"
                            />

                            <AnimatePresence>
                                {medicReport && (
                                    <motion.div
                                        initial={{ x: 300, opacity: 0 }}
                                        animate={{ x: 0, opacity: 1 }}
                                        exit={{ x: 300, opacity: 0 }}
                                        style={{
                                            width: '350px',
                                            background: 'rgba(10, 10, 25, 0.98)',
                                            borderLeft: '1px solid var(--primary-glow)',
                                            padding: '24px',
                                            overflowY: 'auto',
                                            fontSize: '0.85rem',
                                            color: 'white',
                                            fontFamily: 'JetBrains Mono',
                                            boxShadow: '-10px 0 30px rgba(0,0,0,0.5)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                            <h3 style={{ color: 'var(--primary)', fontSize: '0.9rem', fontWeight: 700 }}>AI DIAGNOSTIC REPORT</h3>
                                            <button onClick={() => setMedicReport(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                                                <FiX />
                                            </button>
                                        </div>
                                        <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6, color: '#bcc' }}>
                                            {medicReport}
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </>
                ) : (
                    <div style={{ flex: 1, padding: '40px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)' }}>
                        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <div style={{ marginBottom: '40px' }}>
                                <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>Cloud <span className="glow-text">Secrets</span></h2>
                                <p style={{ color: 'var(--text-dim)', fontSize: '1rem', lineHeight: 1.5 }}>
                                    Manage sensitive environment variables. These are injected securely into your container during the "Runtime Execution" stage.
                                </p>
                            </div>

                            <div className="glass beveled" style={{ padding: '30px', marginBottom: '40px', background: 'rgba(0, 242, 255, 0.02)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '20px', alignItems: 'end' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '10px', fontWeight: 600 }}>VARIABLE KEY</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. DATABASE_URL"
                                            value={newSecret.key}
                                            onChange={(e) => setNewSecret({...newSecret, key: e.target.value.toUpperCase().replace(/\s/g, '_')})}
                                            style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '0.9rem', outline: 'none', fontFamily: 'JetBrains Mono' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '10px', fontWeight: 600 }}>VALUE</label>
                                        <input 
                                            type="password" 
                                            placeholder="sensitive_value_here"
                                            value={newSecret.value}
                                            onChange={(e) => setNewSecret({...newSecret, value: e.target.value})}
                                            style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '0.9rem', outline: 'none', fontFamily: 'JetBrains Mono' }}
                                        />
                                    </div>
                                    <button className="btn btn-primary" style={{ padding: '14px 24px' }} onClick={handleAddSecret}>
                                        <FiPlusCircle /> ADD VARIABLE
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gap: '12px' }}>
                                {Object.entries(secrets).map(([key, value]) => (
                                    <div key={key} className="glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.05)' }}>
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                            <FiLock style={{ color: 'var(--text-dim)', marginRight: '15px' }} />
                                            <div style={{ marginRight: '40px', minWidth: '150px' }}>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '2px' }}>KEY</div>
                                                <div style={{ fontFamily: 'JetBrains Mono', color: 'var(--primary)', fontWeight: 600, fontSize: '0.95rem' }}>{key}</div>
                                            </div>
                                            <div style={{ flex: 1 }}>
                                                <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', marginBottom: '2px' }}>VALUE</div>
                                                <div style={{ fontFamily: 'JetBrains Mono', color: '#e2e2ee', fontSize: '0.95rem' }}>
                                                    {revealedSecrets.has(key) ? value : '••••••••••••••••'}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button 
                                                onClick={() => toggleSecretReveal(key)}
                                                className="btn btn-outline"
                                                style={{ padding: '8px', minWidth: '40px', border: '1px solid #333' }}
                                                title={revealedSecrets.has(key) ? 'Hide Secret' : 'Reveal Secret'}
                                            >
                                                {revealedSecrets.has(key) ? <FiEyeOff /> : <FiEye />}
                                            </button>
                                            <button 
                                                onClick={() => handleDeleteSecret(key)}
                                                className="btn btn-outline"
                                                style={{ padding: '8px', minWidth: '40px', border: '1px solid #333', color: 'var(--danger)' }}
                                                title="Delete Secret"
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                                {Object.keys(secrets).length === 0 && (
                                    <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-dim)', background: 'rgba(0,0,0,0.1)', border: '1px dashed var(--glass-border)' }}>
                                        No environment variables configured.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {loading && (
                    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 100 }}>
                        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><FiActivity color="var(--primary)" size={32} /></motion.div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default EditorPage;
