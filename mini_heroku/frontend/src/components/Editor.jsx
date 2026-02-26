import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FiSave, FiX, FiFile, FiPlay } from 'react-icons/fi';
import { motion } from 'framer-motion';

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
            alert("File saved successfully!");
        } catch (err) {
            console.error("Error saving file:", err);
            alert("Failed to save file.");
        }
        setSaving(false);
    };

    return (
        <motion.div
            className="editor-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
        >
            <div className="glass-panel editor-container">
                <div className="editor-sidebar">
                    <div style={{ padding: '16px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h4 style={{ margin: 0 }}>Files</h4>
                    </div>
                    <div className="file-list">
                        {files.map(file => (
                            <div
                                key={file}
                                className={`file-item ${selectedFile === file ? 'active' : ''}`}
                                onClick={() => loadFile(file)}
                            >
                                <FiFile size={14} /> {file}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="editor-main">
                    <div className="editor-toolbar">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{selectedFile}</span>
                        </div>
                        <div style={{ display: 'flex', gap: '12px' }}>
                            <button className="btn-save" onClick={handleSave} disabled={saving}>
                                <FiSave /> {saving ? 'Saving...' : 'Save'}
                            </button>
                            <button className="btn-primary" style={{ padding: '6px 16px', fontSize: '0.9rem' }} onClick={() => onRedeploy(appName)}>
                                <FiPlay /> Redeploy
                            </button>
                            <button className="btn-close" onClick={onClose}>
                                <FiX />
                            </button>
                        </div>
                    </div>
                    <textarea
                        className="code-textarea"
                        value={content}
                        onChange={(e) => setContent(e.target.value)}
                        spellCheck="false"
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default Editor;
