import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSave, FiX, FiFile, FiPlay, FiChevronRight, FiCode } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';

const Editor = ({ appName, onClose, onRedeploy }) => {
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
            // Show a subtle toast instead of alert if possible, but keeping it simple for now
            console.log("File saved successfully!");
        } catch (err) {
            console.error("Error saving file:", err);
        }
        setSaving(false);
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100vw',
                height: '100vh',
                background: 'rgba(0, 0, 0, 0.85)',
                backdropFilter: 'blur(12px)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                zIndex: 1000,
                padding: '40px'
            }}
        >
            <motion.div
                initial={{ scale: 0.95, y: 20 }}
                animate={{ scale: 1, y: 0 }}
                className="glass"
                style={{
                    width: '100%',
                    height: '100%',
                    maxWidth: '1300px',
                    display: 'flex',
                    overflow: 'hidden',
                    flexDirection: 'column'
                }}
            >
                {/* Editor Header */}
                <div style={{
                    padding: '16px 24px',
                    borderBottom: '1px solid var(--glass-border)',
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    background: 'rgba(255, 255, 255, 0.02)'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                        <div style={{
                            padding: '8px',
                            borderRadius: '8px',
                            background: 'rgba(0, 242, 255, 0.05)',
                            color: 'var(--primary)',
                            display: 'flex'
                        }}>
                            <FiCode size={20} />
                        </div>
                        <div>
                            <h4 style={{ margin: 0, fontSize: '1rem' }}>Editing: {appName}</h4>
                            <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                                root <FiChevronRight size={10} /> {selectedFile}
                            </div>
                        </div>
                    </div>

                    <div style={{ display: 'flex', gap: '12px' }}>
                        <button className="btn btn-outline" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={handleSave} disabled={saving}>
                            <FiSave /> {saving ? 'Saving...' : 'Save Changes'}
                        </button>
                        <button className="btn btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }} onClick={() => onRedeploy(appName)}>
                            <FiPlay /> Redeploy
                        </button>
                        <button
                            style={{
                                background: 'transparent',
                                border: 'none',
                                color: 'var(--text-dim)',
                                cursor: 'pointer',
                                padding: '8px'
                            }}
                            onClick={onClose}
                        >
                            <FiX size={20} />
                        </button>
                    </div>
                </div>

                <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
                    {/* Sidebar */}
                    <div style={{
                        width: '260px',
                        borderRight: '1px solid var(--glass-border)',
                        display: 'flex',
                        flexDirection: 'column',
                        background: 'rgba(0, 0, 0, 0.1)'
                    }}>
                        <div className="file-list" style={{ padding: '12px' }}>
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
            </motion.div>
        </motion.div>
    );
};

export default Editor;
