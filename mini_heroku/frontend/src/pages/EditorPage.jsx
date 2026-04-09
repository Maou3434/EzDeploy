import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiSave, FiX, FiFile, FiPlay, FiChevronRight, FiCode, FiActivity, FiArrowLeft, FiPlusCircle, FiCheckCircle, FiTrash2, FiLock, FiEye, FiEyeOff, FiShield, FiAlertCircle, FiCpu } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { runDiagnostics, runSentinelScan, generateFix } from '../services/OllamaService';

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
    const [activeTab, setActiveTab] = useState('code'); // 'code', 'config', 'sentinel'
    const [sentinelIssues, setSentinelIssues] = useState([]);
    const [scanning, setScanning] = useState(false);
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

    const fetchFiles = async () => {
        setLoading(true);
        try {
            const res = await axios.get(`/api/files/${appName}`);
            setFiles(res.data);
            if (res.data.length > 0 && !selectedFile) {
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

    const handleSentinelScan = async () => {
        setScanning(true);
        try {
            const rawResults = await runSentinelScan(appName, files);
            try {
                const jsonStr = rawResults.substring(rawResults.indexOf('['), rawResults.lastIndexOf(']') + 1);
                const results = JSON.parse(jsonStr);
                setSentinelIssues(results);
            } catch (e) {
                console.error("Failed to parse Sentinel JSON:", e);
                setSentinelIssues([{
                    type: "architecture",
                    title: "Scan Summary",
                    description: rawResults,
                    severity: "medium",
                    fix_file: null
                }]);
            }
        } catch (err) {
            console.error(err);
        }
        setScanning(false);
    };

    const handleApplyFix = async (issue) => {
        if (!issue.fix_file) return;
        setLoading(true);
        try {
            const fixContent = await generateFix(appName, issue.type, issue.fix_file, issue.description);
            await axios.post(`/api/files/${appName}/write`, {
                path: issue.fix_file,
                content: fixContent
            });
            await fetchFiles();
            handleSentinelScan();
        } catch (err) {
            console.error("Fix failed:", err);
        }
        setLoading(false);
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
                            {activeTab === 'code' ? <>FILES <FiChevronRight size={12} /> {selectedFile}</> : 
                             activeTab === 'config' ? <>CONFIGURATION <FiChevronRight size={12} /> SECRETS</> :
                             <>AI SENTINEL <FiChevronRight size={12} /> RADAR SCAN</>}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="glass" style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '12px', marginRight: '20px' }}>
                        {['code', 'config', 'sentinel'].map(tab => (
                            <button 
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                style={{ 
                                    padding: '8px 16px', 
                                    borderRadius: '8px',
                                    border: 'none', 
                                    background: activeTab === tab ? 'var(--primary)' : 'transparent', 
                                    color: activeTab === tab ? '#000' : 'white', 
                                    fontSize: '0.75rem',
                                    fontWeight: 700,
                                    cursor: 'pointer',
                                    transition: 'all 0.3s',
                                    textTransform: 'uppercase'
                                }}
                            >
                                {tab}
                            </button>
                        ))}
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
                ) : activeTab === 'sentinel' ? (
                    <div style={{ flex: 1, padding: '40px', overflowY: 'auto' }}>
                        <div style={{ maxWidth: '900px', margin: '0 auto' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '40px' }}>
                                <div>
                                    <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>AI <span className="glow-text">Sentinel</span> Radar</h2>
                                    <p style={{ color: 'var(--text-dim)', fontSize: '1rem', lineHeight: 1.5 }}>
                                        Project-wide intelligence for architecture optimization and security auditing.
                                    </p>
                                </div>
                                <button className="btn btn-primary" onClick={handleSentinelScan} disabled={scanning}>
                                    <FiShield /> {scanning ? 'SCANNING RADAR...' : 'TRIGGER FULL SCAN'}
                                </button>
                            </div>

                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(400px, 1fr))', gap: '20px' }}>
                                {sentinelIssues.map((issue, idx) => (
                                    <motion.div 
                                        key={idx}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="glass beveled"
                                        style={{ 
                                            padding: '24px', 
                                            borderLeft: `4px solid ${issue.severity === 'high' ? 'var(--danger)' : 'var(--primary)'}`,
                                            background: 'rgba(255,255,255,0.01)'
                                        }}
                                    >
                                        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '15px' }}>
                                            <span style={{ 
                                                fontSize: '0.65rem', 
                                                fontWeight: 800, 
                                                padding: '4px 8px', 
                                                background: 'rgba(0,0,0,0.3)', 
                                                color: issue.type === 'security' ? 'var(--danger)' : 'var(--primary)',
                                                border: `1px solid ${issue.type === 'security' ? 'var(--danger)' : 'var(--primary)'}`
                                            }}>
                                                {(issue.type || 'TASK').toUpperCase()}
                                            </span>
                                            <span style={{ color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                                                {(issue.severity || 'MEDIUM').toUpperCase()} PRIORITY
                                            </span>
                                        </div>
                                        <h3 style={{ fontSize: '1.1rem', marginBottom: '10px' }}>{issue.title}</h3>
                                        <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem', marginBottom: '24px', lineHeight: 1.6 }}>{issue.description}</p>
                                        
                                        {issue.fix_file && (
                                            <button 
                                                className="btn btn-outline" 
                                                style={{ width: '100%', justifyContent: 'center', borderColor: 'var(--primary)', color: 'var(--primary)' }}
                                                onClick={() => handleApplyFix(issue)}
                                            >
                                                <FiCpu /> {issue.fix_label || `Generate ${issue.fix_file}`}
                                            </button>
                                        )}
                                    </motion.div>
                                ))}
                                {sentinelIssues.length === 0 && !scanning && (
                                    <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '100px', background: 'rgba(0,0,0,0.1)', border: '1px dashed var(--glass-border)' }}>
                                        <FiShield size={48} color="var(--text-dim)" style={{ marginBottom: '20px', opacity: 0.3 }} />
                                        <p style={{ color: 'var(--text-dim)' }}>Radar sweep required. Trigger a full scan to identify project-level optimizations.</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                ) : (
                    <div style={{ flex: 1, padding: '40px', overflowY: 'auto', background: 'rgba(0,0,0,0.2)' }}>
                        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
                            <div style={{ marginBottom: '40px' }}>
                                <h2 style={{ fontSize: '1.8rem', marginBottom: '12px' }}>Cloud <span className="glow-text">Secrets</span></h2>
                                <p style={{ color: 'var(--text-dim)', fontSize: '1rem', lineHeight: 1.5 }}>
                                    Manage sensitive environment variables injected at runtime.
                                </p>
                            </div>

                            <div className="glass beveled" style={{ padding: '30px', marginBottom: '40px', background: 'rgba(0, 242, 255, 0.02)' }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '20px', alignItems: 'end' }}>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '10px' }}>VARIABLE KEY</label>
                                        <input 
                                            type="text" 
                                            placeholder="e.g. DATABASE_URL"
                                            value={newSecret.key}
                                            onChange={(e) => setNewSecret({...newSecret, key: e.target.value.toUpperCase().replace(/\s/g, '_')})}
                                            style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                                        />
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontSize: '0.75rem', color: 'var(--text-dim)', marginBottom: '10px' }}>VALUE</label>
                                        <input 
                                            type="password" 
                                            placeholder="sensitive_value"
                                            value={newSecret.value}
                                            onChange={(e) => setNewSecret({...newSecret, value: e.target.value})}
                                            style={{ width: '100%', padding: '14px', background: 'rgba(0,0,0,0.4)', border: '1px solid var(--glass-border)', color: 'white', fontSize: '0.9rem', outline: 'none' }}
                                        />
                                    </div>
                                    <button className="btn btn-primary" style={{ padding: '14px 24px' }} onClick={handleAddSecret}>
                                        <FiPlusCircle /> ADD
                                    </button>
                                </div>
                            </div>

                            <div style={{ display: 'grid', gap: '12px' }}>
                                {Object.entries(secrets).map(([key, value]) => (
                                    <div key={key} className="glass" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px' }}>
                                        <div style={{ flex: 1, display: 'flex', alignItems: 'center' }}>
                                            <FiLock style={{ color: 'var(--text-dim)', marginRight: '15px' }} />
                                            <div>
                                                <div style={{ fontFamily: 'JetBrains Mono', color: 'var(--primary)', fontWeight: 600 }}>{key}</div>
                                                <div style={{ fontFamily: 'JetBrains Mono', color: '#e2e2ee', fontSize: '0.85rem' }}>
                                                    {revealedSecrets.has(key) ? value : '••••••••••••••••'}
                                                </div>
                                            </div>
                                        </div>
                                        <div style={{ display: 'flex', gap: '8px' }}>
                                            <button onClick={() => toggleSecretReveal(key)} className="btn btn-outline" style={{ padding: '8px' }}>
                                                {revealedSecrets.has(key) ? <FiEyeOff /> : <FiEye />}
                                            </button>
                                            <button onClick={() => handleDeleteSecret(key)} className="btn btn-outline" style={{ padding: '8px', color: 'var(--danger)' }}>
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </div>
                                ))}
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
