import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiMessageSquare, FiX, FiCpu, FiCornerDownLeft } from 'react-icons/fi';
import { getAIResponse } from '../services/OllamaService';

const AIBuddy = ({ context = "" }) => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState("Hello! I'm your EZDeploy Architect. How can I help with your deployment today?");
    const [loading, setLoading] = useState(false);

    const handlePing = async () => {
        setLoading(true);
        const prompt = context 
            ? `Given this context: ${context}. Give me a quick architecture tip.` 
            : "Give me a quick tip for cloud deployment efficiency.";
        const res = await getAIResponse(prompt, "You are EZDeploy AI. Keep answers under 30 words.");
        setMessage(res);
        setLoading(false);
    };

    return (
        <div style={{ position: 'fixed', bottom: '30px', right: '30px', zIndex: 1000 }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.8, y: 20 }}
                        className="glass"
                        style={{
                            width: '320px',
                            minHeight: '150px',
                            padding: '24px',
                            marginBottom: '15px',
                            position: 'relative',
                            border: '1px solid var(--primary-glow)'
                        }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary)' }}>
                                <FiCpu /> <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>EZ-AI ARCHITECT</span>
                            </div>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'transparent', border: 'none', color: 'var(--text-dim)', cursor: 'pointer' }}>
                                <FiX />
                            </button>
                        </div>
                        
                        <p style={{ fontSize: '0.9rem', lineHeight: 1.5, color: '#fff' }}>
                            {loading ? "Thinking..." : message}
                        </p>

                        <div style={{ marginTop: '20px', display: 'flex', gap: '8px' }}>
                            <button 
                                onClick={handlePing}
                                className="btn btn-outline" 
                                style={{ padding: '6px 12px', fontSize: '0.7rem', flex: 1 }}
                            >
                                <FiCornerDownLeft /> Get Tip
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
                    borderRadius: '30px',
                    background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                    border: 'none',
                    color: 'white',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    boxShadow: '0 8px 32px var(--primary-glow)'
                }}
            >
                {isOpen ? <FiX size={24} /> : <FiMessageSquare size={24} />}
            </motion.button>
        </div>
    );
};

export default AIBuddy;
