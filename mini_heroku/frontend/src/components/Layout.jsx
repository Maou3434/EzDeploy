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
        <div className="app-wrapper" style={{ display: 'flex', minHeight: '100vh' }}>
            <Background />

            {/* Sidebar */}
            <nav className="glass" style={{
                width: '280px',
                height: 'calc(100vh - 40px)',
                margin: '20px',
                padding: '30px 20px',
                display: 'flex',
                flexDirection: 'column',
                position: 'sticky',
                top: '20px',
                zIndex: 10
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '50px', padding: '0 10px' }}>
                    <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, var(--primary), var(--secondary))',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 0 15px var(--primary-glow)'
                    }}>
                        <FiActivity size={24} color="white" />
                    </div>
                    <span style={{ fontSize: '1.5rem', fontWeight: 800, letterSpacing: '1px' }} className="glow-text">EZDEPLOY</span>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                    {navItems.map((item) => (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            style={{ display: 'flex', alignItems: 'center', gap: '12px' }}
                        >
                            {item.icon}
                            {item.label}
                        </NavLink>
                    ))}
                </div>

                <div style={{ marginTop: 'auto', padding: '20px 10px', borderTop: '1px solid var(--glass-border)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--success)', boxShadow: '0 0 10px var(--success)' }}></div>
                        System Operational
                    </div>
                </div>
            </nav>

            {/* Main Content */}
            <main style={{ flex: 1, padding: '40px 20px', position: 'relative' }}>
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
