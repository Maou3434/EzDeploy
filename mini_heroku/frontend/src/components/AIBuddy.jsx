import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiActivity, FiZap, FiCpu, FiAlertCircle } from 'react-icons/fi';
import { getAIResponse } from '../services/OllamaService';

const AIBuddy = ({ context = "", status = "idle" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("I'm and analyzing your deployment environment. How can I assist you today?");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (status === 'error') {
            setIsOpen(true);
            setMessage("An error has been detected in the deployment pipeline. Would you like me to analyze the logs for a solution?");
        }
    }, [status]);

    const handlePing = async () => {
        setLoading(true);
        const prompt = context 
            ? `Context: ${context}. Status: ${status}. Provide a professional deployment advice.` 
            : "Give me a professional tip for optimizing cloud-native applications.";
        const res = await getAIResponse(prompt, "You are a Professional Cloud Architect. Keep it concise and actionable.");
        setMessage(res);
        setLoading(false);
    };

    return (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, x: 20 }}
                        animate={{ opacity: 1, scale: 1, x: 0 }}
                        exit={{ opacity: 0, scale: 0.9, x: 20 }}
                        className="glass beveled"
                        style={{
                            width: '350px',
                            minHeight: '180px',
                            padding: '24px',
                            marginBottom: '15px',
                            border: `1px solid ${status === 'error' ? 'var(--danger)' : 'var(--primary-glow)'}`,
                            boxShadow: `0 15px 50px rgba(0,0,0,0.5)`
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: status === 'error' ? 'var(--danger)' : 'var(--primary)' }}>
                                {status === 'error' ? <FiAlertCircle /> : <FiCpu />}
                                <span style={{ fontSize: '0.75rem', fontWeight: 700, letterSpacing: '1px' }}>AI ASSISTANT</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                                <FiX />
                            </button>
                        </div>
                        
                        <div style={{ 
                            fontSize: '0.9rem', 
                            lineHeight: 1.6, 
                            color: '#e2e2ee', 
                            background: 'rgba(255,255,255,0.03)',
                            padding: '16px',
                            borderLeft: `2px solid ${status === 'error' ? 'var(--danger)' : 'var(--primary)'}`
                        }}>
                            {loading ? "Analyzing system parameters..." : message}
                        </div>

                        <div style={{ marginTop: '20px', display: 'flex', gap: '12px' }}>
                            <button 
                                onClick={handlePing}
                                className="btn btn-primary" 
                                style={{ padding: '10px 20px', fontSize: '0.8rem', flex: 1 }}
                            >
                                <FiZap /> Ask for Insights
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: '60px',
                    height: '60px',
                    borderRadius: '0', 
                    background: status === 'error' ? 'var(--danger)' : 'var(--primary)',
                    border: 'none',
                    color: '#000',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                    clipPath: 'polygon(15% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%, 0% 15%)'
                }}
            >
                {status === 'error' ? <FiAlertCircle size={24} /> : <FiCpu size={24} />}
            </motion.button>
        </div>
    );
};

export default AIBuddy;
