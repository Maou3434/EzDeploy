import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiGithub, FiStar, FiZap, FiBox, FiArrowRight, FiX, FiCheckCircle, FiLoader } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';
import { getTemplates, deployTemplate } from '../services/TemplateService';

const MarketplacePage = () => {
    const navigate = useNavigate();
    const [templates, setTemplates] = useState([]);
    const [search, setSearch] = useState('');
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [appName, setAppName] = useState('');
    const [customRepo, setCustomRepo] = useState('');
    const [isDeploying, setIsDeploying] = useState(false);

    useEffect(() => {
        const load = async () => {
            const data = await getTemplates();
            setTemplates(data);
        };
        load();
    }, []);

    const handleDeploy = async () => {
        if (!appName) return alert("Please specify an application name");
        setIsDeploying(true);
        try {
            const res = await deployTemplate(
                appName, 
                selectedTemplate?.id || null, 
                selectedTemplate ? null : customRepo
            );
            if (res.status === 'accepted') {
                navigate('/deploy'); // In a real app, we'd pass the task_id to start tracking
            }
        } catch (err) {
            alert("Deployment failed to initialize.");
        }
        setIsDeploying(false);
        setSelectedTemplate(null);
    };

    const filtered = templates.filter(t => 
        t.name.toLowerCase().includes(search.toLowerCase()) || 
        t.tech.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
            <header style={{ marginBottom: '50px' }}>
                <h1 style={{ fontSize: '2.5rem', marginBottom: '10px' }}>Verified <span className="glow-text">Boilerplates</span></h1>
                <p style={{ color: 'var(--text-dim)' }}>Select a professionally pre-configured stack to initialize your project instantly.</p>
            </header>

            {/* Search & Filters */}
            <div style={{ position: 'relative', marginBottom: '30px', maxWidth: '400px' }}>
                <FiSearch style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-dim)' }} />
                <input 
                    type="text" 
                    placeholder="Search curated stacks..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{
                        width: '100%',
                        padding: '12px 12px 12px 44px',
                        background: 'transparent',
                        border: '1px solid var(--glass-border)',
                        color: 'white',
                        fontSize: '0.9rem',
                        outline: 'none'
                    }}
                />
            </div>

            {/* Template Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '24px' }}>
                {filtered.map(template => (
                    <motion.div 
                        key={template.id}
                        whileHover={{ y: -5 }}
                        className="glass beveled"
                        style={{ padding: '30px', borderBottom: `4px solid ${template.type === 'official' ? 'var(--primary)' : '#fff'}` }}
                    >
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '20px' }}>
                            <div style={{ 
                                width: '48px', 
                                height: '48px', 
                                background: 'rgba(255,255,255,0.05)', 
                                display: 'flex', 
                                alignItems: 'center', 
                                justifyContent: 'center',
                                color: 'var(--primary)',
                                border: '1px solid var(--glass-border)',
                                clipPath: 'polygon(15% 0%, 100% 0%, 100% 85%, 85% 100%, 0% 100%, 0% 15%)'
                            }}>
                                {template.tech === 'Python' ? <FiZap /> : <FiBox />}
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <div style={{ fontSize: '0.75rem', color: 'var(--text-dim)', letterSpacing: '2px', marginBottom: '8px', fontWeight: 700 }}>
                                    {template.type.toUpperCase()}
                                </div>
                                {template.stars && (
                                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: '#ffbd00', fontWeight: 600 }}>
                                        <FiStar fill="#ffbd00" /> {template.stars.toLocaleString()}
                                    </div>
                                )}
                            </div>
                        </div>

                        <h3 style={{ fontSize: '1.2rem', marginBottom: '12px' }}>{template.name}</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.6, marginBottom: '24px', minHeight: '3rem' }}>
                            {template.description}
                        </p>

                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ 
                                padding: '4px 12px', 
                                background: 'rgba(0, 242, 255, 0.1)', 
                                color: 'var(--primary)', 
                                fontSize: '0.7rem', 
                                fontWeight: 700,
                                fontFamily: 'Outfit'
                            }}>
                                {template.tech.toUpperCase()}
                            </span>
                            <button 
                                className="btn btn-primary" 
                                style={{ padding: '8px 20px', fontSize: '0.8rem' }}
                                onClick={() => setSelectedTemplate(template)}
                            >
                                DEPLOY <FiArrowRight />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>

            {/* Deployment Modal */}
            <AnimatePresence>
                {selectedTemplate && (
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{ 
                            position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', 
                            background: 'rgba(0,0,0,0.8)', zIndex: 2000,
                            display: 'flex', alignItems: 'center', justifyContent: 'center'
                        }}
                    >
                        <motion.div 
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            className="glass beveled"
                            style={{ width: '450px', padding: '40px', border: '1px solid var(--primary)' }}
                        >
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '30px' }}>
                                <h2 style={{ fontSize: '1.5rem' }}>DEPLOY TEMPLATE</h2>
                                <button onClick={() => setSelectedTemplate(null)} style={{ background: 'transparent', border: 'none', color: 'white', cursor: 'pointer' }}>
                                    <FiX size={24} />
                                </button>
                            </div>

                            <div style={{ marginBottom: '24px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px', letterSpacing: '1px' }}>
                                    CHOSEN TEMPLATE
                                </label>
                                <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>{selectedTemplate.name}</div>
                            </div>

                            <div style={{ marginBottom: '30px' }}>
                                <label style={{ display: 'block', fontSize: '0.8rem', color: 'var(--text-dim)', marginBottom: '8px', letterSpacing: '1px' }}>
                                    APPLICATION NAME
                                </label>
                                <input 
                                    type="text" 
                                    placeholder="e.g. my-awesome-app"
                                    value={appName}
                                    onChange={(e) => setAppName(e.target.value)}
                                    autoFocus
                                    style={{
                                        width: '100%',
                                        padding: '14px',
                                        background: 'rgba(255,255,255,0.05)',
                                        border: '1px solid var(--glass-border)',
                                        color: 'white',
                                        fontSize: '1rem',
                                        outline: 'none'
                                    }}
                                />
                            </div>

                            <button 
                                className="btn btn-primary" 
                                style={{ width: '100%', padding: '16px' }}
                                onClick={handleDeploy}
                                disabled={isDeploying}
                            >
                                {isDeploying ? <><FiLoader className="spin" /> INITIALIZING...</> : <><FiCheckCircle /> CONFIRM DEPLOYMENT</>}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <style>{`
                .spin { animation: spin 1s linear infinite; }
                @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
            `}</style>
        </div>
    );
};

export default MarketplacePage;
