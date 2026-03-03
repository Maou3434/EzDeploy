import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { FiSave, FiX, FiFile, FiPlay, FiChevronRight, FiCode, FiActivity, FiArrowLeft } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const EditorPage = ({ onRedeploy }) => {
    const { appName } = useParams();
    const navigate = useNavigate();
    const [files, setFiles] = useState([]);
    const [selectedFile, setSelectedFile] = useState(null);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchFiles();
    }, [appName]);

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
        try {
            const res = await axios.get(`/api/files/${appName}/read?path=${path}`);
            setContent(res.data.content);
        } catch (err) {
            console.error("Error loading file:", err);
        }
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await axios.post(`/api/files/${appName}/write`, {
                path: selectedFile,
                content: content
            });
            console.log("File saved successfully!");
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
                            borderRadius: '12px',
                            cursor: 'pointer',
                            display: 'flex'
                        }}
                    >
                        <FiArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 style={{ fontSize: '1.5rem', marginBottom: '4px' }}>Editing <span className="glow-text">{appName}</span></h1>
                        <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                            root <FiChevronRight size={12} /> {selectedFile}
                        </div>
                    </div>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <button className="btn btn-outline" onClick={handleSave} disabled={saving}>
                        <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button className="btn btn-primary" onClick={handleRedeploy}>
                        <FiPlay /> Redeploy
                    </button>
                </div>
            </header>

            <div className="glass" style={{ flex: 1, display: 'flex', overflow: 'hidden' }}>
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
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '10px',
                                    fontSize: '0.9rem',
                                    transition: 'all 0.2s',
                                    color: selectedFile === file ? 'white' : 'var(--text-dim)',
                                    background: selectedFile === file ? 'rgba(0, 242, 255, 0.1)' : 'transparent',
                                    marginBottom: '4px'
                                }}
                                onClick={() => loadFile(file)}
                            >
                                <FiFile size={14} color={selectedFile === file ? 'var(--primary)' : 'inherit'} />
                                {file}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Editor Area */}
                <div style={{ flex: 1, display: 'flex', flexDirection: 'column', position: 'relative' }}>
                    <textarea
                        style={{
                            flex: 1,
                            background: 'transparent',
                            border: 'none',
                            color: '#e2e2ee',
                            padding: '30px',
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '0.95rem',
                            lineHeight: '1.6',
                            resize: 'none',
                            outline: 'none'
                        }}
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        spellCheck="false"
                    />
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
