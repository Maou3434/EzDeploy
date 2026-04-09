import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiHome, FiUploadCloud, FiGrid, FiSettings, FiActivity } from 'react-icons/fi';
import Background from './Background';

const Layout = ({ children }) => {
    const location = useLocation();

    const navItems = [
        { path: '/', icon: <FiHome />, label: 'Home' },
        { path: '/deploy', icon: <FiUploadCloud />, label: 'Deploy' },
        { path: '/dashboard', icon: <FiGrid />, label: 'Dashboard' },
    ];

    return (
        <div className="app-wrapper" style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
            <Background />

            {/* Top Navigation */}
            <nav className="glass beveled" style={{
                margin: '20px auto',
                width: 'calc(100% - 40px)',
                maxWidth: '1200px',
                padding: '12px 30px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: '20px',
                zIndex: 100
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 15px var(--primary-glow)'
                    }}>
                        <FiActivity size={20} color="white" />
                    </div>
                    <span style={{ fontSize: '1.2rem', fontWeight: 800, letterSpacing: '1px' }} className="glow-text">EZDEPLOY</span>
                </div>

                <div style={{ display: 'flex', gap: '32px' }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            style={{ 
                                display: 'flex', 
                                alignItems: 'center', 
                                gap: '10px'
                            }}
                        >
                            <span style={{ fontSize: '1.1rem', display: 'flex' }}>{item.icon}</span>
                            {item.label}
                        </NavLink>
                    ))}
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-dim)', fontSize: '0.75rem' }}>
                    <div style={{ width: '6px', height: '6px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }}></div>
                    Live
                </div>
            </nav>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '20px 20px 60px', position: 'relative', width: '100%', maxWidth: '1400px', margin: '0 auto' }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={location.pathname}
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -15 }}
                        transition={{ duration: 0.3, ease: 'easeOut' }}
                        style={{ width: '100%', height: '100%' }}
                    >
                        {children}
                    </motion.div>
                </AnimatePresence>
            </main>
        </div>
    );
};

export default Layout;
