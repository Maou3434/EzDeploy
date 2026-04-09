import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiSave, FiX, FiFile, FiPlay, FiChevronRight, FiCode, FiActivity, FiArrowLeft, FiPlusCircle, FiCheckCircle } from 'react-icons/fi';
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

    const autoScanTimer = useRef(null);

    useEffect(() => {
        fetchFiles();
    }, [appName]);

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
                        <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Code Editor: <span className="glow-text">{appName}</span></h1>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '5px', fontFamily: 'Outfit' }}>
                            APPLICATION <FiChevronRight size={12} /> {selectedFile}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-outline" onClick={() => handleSanityCheck()} disabled={analyzing}>
                        <FiPlusCircle color={medicReport ? 'var(--primary)' : 'inherit'} /> {analyzing ? 'DIAGNOSING...' : 'AI DIAGNOSTIC'}
                    </button>
                    <button className="btn btn-outline" onClick={handleSave} disabled={saving}>
                        <FiSave /> {saving ? 'SAVING...' : 'SAVE CHANGES'}
                    </button>
                    <button className="btn btn-primary" onClick={handleRedeploy}>
                        <FiPlay /> REDEPLOY APP
                    </button>
                </div>
            </header>

            <div className="glass beveled" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
                {/* File Sidebar */}
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

                {/* Editor Area */}
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

                    {/* AI Medic Panel */}
                    <AnimatePresence>
                        {medicReport && (
                            <motion.div
                                initial={{ x: 300, opacity: 0 }}
                                animate={{ x: 0, opacity: 1 }}
                                exit={{ x: 300, opacity: 0 }}
                                style={{
                                    width: '350px',
                                    background: 'rgba(10, 10, 25, 0.95)',
                                    borderLeft: '1px solid var(--primary-glow)',
                                    padding: '24px',
                                    overflowY: 'auto',
                                    fontSize: '0.85rem',
                                    color: 'white',
                                    fontFamily: 'JetBrains Mono'
                                }}
                            >
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                                    <h3 style={{ color: 'var(--primary)', fontSize: '1rem' }}>MEDIC REPORT</h3>
                                    <button onClick={() => setMedicReport(null)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                                        <FiX />
                                    </button>
                                </div>
                                <div style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>
                                    {medicReport}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    {loading && (
                        <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}><FiActivity color="var(--primary)" size={32} /></motion.div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EditorPage;
