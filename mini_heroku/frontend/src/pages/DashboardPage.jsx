import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { FiServer, FiActivity, FiExternalLink, FiCode, FiTrash2, FiSearch, FiFilter, FiBox, FiGrid as FiGridIcon } from 'react-icons/fi';
import FleetGraph from '../components/FleetGraph';

const DashboardPage = ({ containers, deleteContainer }) => {
    const navigate = useNavigate();
    const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'fleet'

    return (
        <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
            <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '48px', padding: '0 10px' }}>
                <div>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '8px' }}>Deployment <span className="glow-text">Manager</span></h1>
                    <p style={{ color: 'var(--text-dim)' }}>Monitor and control your active applications.</p>
                </div>

                <div style={{ display: 'flex', gap: '12px' }}>
                    <div className="glass" style={{ display: 'flex', gap: '4px', padding: '4px', borderRadius: '12px', marginRight: '10px' }}>
                        <button 
                            onClick={() => setViewMode('grid')}
                            style={{ 
                                padding: '8px 12px', 
                                borderRadius: '8px', 
                                border: 'none', 
                                background: viewMode === 'grid' ? 'var(--primary)' : 'transparent',
                                color: viewMode === 'grid' ? '#000' : 'white',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            <FiGridIcon />
                        </button>
                        <button 
                            onClick={() => setViewMode('fleet')}
                            style={{ 
                                padding: '8px 12px', 
                                borderRadius: '8px', 
                                border: 'none', 
                                background: viewMode === 'fleet' ? 'var(--primary)' : 'transparent',
                                color: viewMode === 'fleet' ? '#000' : 'white',
                                cursor: 'pointer',
                                transition: 'all 0.3s'
                            }}
                        >
                            <FiBox />
                        </button>
                    </div>

                    <div className="glass" style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 16px', borderRadius: '12px' }}>
                        <FiSearch color="var(--text-dim)" />
                        <input
                            type="text"
                            placeholder="Search apps..."
                            style={{ background: 'transparent', border: 'none', color: 'white', outline: 'none', fontSize: '0.9rem', width: '200px' }}
                        />
                    </div>
                </div>
            </header>

            {containers.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    style={{
                        padding: '100px 40px',
                        textAlign: 'center',
                        background: 'rgba(255,255,255,0.02)',
                        borderRadius: '24px',
                        border: '1px dashed var(--glass-border)'
                    }}
                >
                    <FiServer size={48} color="var(--text-dim)" style={{ marginBottom: '20px', opacity: 0.3 }} />
                    <h3 style={{ fontSize: '1.5rem', marginBottom: '10px', color: 'var(--text-dim)' }}>Fleet is empty</h3>
                    <p style={{ color: 'var(--text-dim)', marginBottom: '30px' }}>No active deployments found on this cluster.</p>
                    <a href="/deploy" className="btn btn-primary">Deploy First App</a>
                </motion.div>
            ) : (
                <>
                    {viewMode === 'fleet' && (
                        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} style={{ marginBottom: '40px' }}>
                            <FleetGraph containers={containers} />
                        </motion.div>
                    )}

                    <div style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))',
                        gap: '24px'
                    }}>
                        <AnimatePresence>
                            {containers.map((container, idx) => {
                                const port = container.ports ? container.ports.split('->')[0].split(':')[1] : null;
                                const isUp = container.status.startsWith('Up');

                                return (
                                    <motion.div
                                        key={container.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        exit={{ opacity: 0, scale: 0.9 }}
                                        transition={{ delay: idx * 0.05 }}
                                        className="glass"
                                        style={{
                                            padding: '24px',
                                            position: 'relative',
                                            overflow: 'hidden',
                                            borderLeft: `4px solid ${isUp ? 'var(--success)' : 'var(--danger)'}`
                                        }}
                                    >
                                        {/* Status Indicator Glow */}
                                        <div style={{
                                            position: 'absolute',
                                            top: '-20px',
                                            right: '-20px',
                                            width: '60px',
                                            height: '60px',
                                            background: isUp ? 'var(--success)' : 'var(--danger)',
                                            filter: 'blur(40px)',
                                            opacity: 0.15
                                        }}></div>

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
                                            <div>
                                                <h2 style={{ fontSize: '1.4rem', marginBottom: '4px' }}>{container.name}</h2>
                                                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-dim)' }}>
                                                    <FiBox size={14} />
                                                    <span style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>Source: {container.source || 'Upload'}</span>
                                                </div>
                                            </div>
                                            <div style={{
                                                padding: '4px 12px',
                                                borderRadius: '50px',
                                                background: isUp ? 'rgba(0, 255, 163, 0.1)' : 'rgba(255, 0, 85, 0.1)',
                                                color: isUp ? 'var(--success)' : 'var(--danger)',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                border: `1px solid ${isUp ? 'rgba(0, 255, 163, 0.2)' : 'rgba(255, 0, 85, 0.2)'}`
                                            }}>
                                                {isUp ? 'ACTIVE' : 'STOPPED'}
                                            </div>
                                        </div>

                                        <div style={{ marginBottom: '28px', background: 'rgba(0,0,0,0.2)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)' }}>
                                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '10px' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Source</span>
                                                <span style={{ fontSize: '0.85rem', textTransform: 'capitalize' }}>{container.source || 'Upload'}</span>
                                            </div>
                                            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--text-dim)' }}>Port</span>
                                                <span style={{ fontSize: '0.85rem', color: 'var(--primary)', fontFamily: 'JetBrains Mono' }}>{port || 'NONE'}</span>
                                            </div>
                                        </div>

                                        <div style={{ display: 'flex', gap: '10px' }}>
                                            {port && (
                                                <a href={`http://localhost:${port}`} target="_blank" rel="noreferrer" className="btn btn-primary" style={{ flex: 1, padding: '10px' }}>
                                                    <FiExternalLink /> Open
                                                </a>
                                            )}
                                            <button
                                                className="btn btn-outline"
                                                style={{ flex: 1, padding: '10px' }}
                                                onClick={() => navigate(`/editor/${container.name}`)}
                                            >
                                                <FiCode /> Edit
                                            </button>
                                            <button
                                                className="btn btn-outline"
                                                style={{ padding: '10px', color: 'var(--danger)', borderColor: 'rgba(255, 0, 85, 0.1)' }}
                                                onClick={() => deleteContainer(container.id)}
                                            >
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </motion.div>
                                );
                            })}
                        </AnimatePresence>
                    </div>
                </>
            )}
        </div>
    );
};

export default DashboardPage;
