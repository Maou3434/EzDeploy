import React from 'react';
import { motion } from 'framer-motion';
import { FiZap, FiShield, FiGlobe, FiCode, FiLayers, FiPlusCircle, FiTerminal, FiChevronRight } from 'react-icons/fi';
import { useNavigate } from 'react-router-dom';

const LandingPage = () => {
    const navigate = useNavigate();

    const features = [
        { icon: <FiZap />, title: 'Sonic Deployment', desc: 'Go from code to production in seconds with our optimized build engine.' },
        { icon: <FiShield />, title: 'Enterprise Core', desc: 'Secure by design, with automated isolation and resource management.' },
        { icon: <FiGlobe />, title: 'Global Edge', desc: 'Instantly accessible applications with automated port mapping and ingress.' },
        { icon: <FiCode />, title: 'Built-in DevX', desc: 'Integrated browser editor with real-time feedback and iterative redeploys.' },
        { icon: <FiLayers />, title: 'PaaS Transparency', desc: 'Full visibility into every stage of the deployment pipeline.' },
    ];

    return (
        <div style={{ padding: '60px 20px', maxWidth: '1200px', margin: '0 auto' }}>
            {/* Hero Section */}
            <div className="glass beveled" style={{
                padding: '80px 40px',
                textAlign: 'center',
                position: 'relative',
                overflow: 'hidden',
                background: 'rgba(10, 10, 25, 0.8)',
                border: '1px solid var(--primary-glow)',
                marginBottom: '60px'
            }}>
                {/* Scanner Overlay Effect */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    background: 'linear-gradient(transparent, rgba(0, 242, 255, 0.05), transparent)',
                    backgroundSize: '100% 200%',
                    animation: 'scan 4s linear infinite',
                    pointerEvents: 'none'
                }}></div>

                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.8 }}
                >
                    <div style={{
                        margin: '0 auto 24px',
                        padding: '8px 16px',
                        background: 'rgba(0, 242, 255, 0.05)',
                        border: '1px solid rgba(0, 242, 255, 0.1)',
                        display: 'inline-block',
                        fontSize: '0.75rem',
                        color: 'var(--primary)',
                        letterSpacing: '2px',
                        fontWeight: 700,
                        fontFamily: 'Outfit'
                    }}>
                        PREMIUM CLOUD ORCHESTRATION
                    </div>

                    <h1 style={{ fontSize: 'clamp(2.5rem, 6vw, 4.5rem)', lineHeight: 1.1, marginBottom: '24px' }}>
                        INTELLIGENT <span className="glow-text">DEPLOYMENT PLATFORM</span>
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: 'var(--text-dim)', maxWidth: '750px', margin: '0 auto 48px', lineHeight: 1.6 }}>
                        High-performance PaaS orchestration with integrated AI diagnostics. Deploy your applications globally with precision and speed.
                    </p>

                    <div style={{ display: 'flex', gap: '20px', justifyContent: 'center', flexWrap: 'wrap' }}>
                        <button onClick={() => navigate('/deploy')} className="btn btn-primary" style={{ padding: '16px 48px', fontSize: '1rem' }}>
                            <FiPlusCircle /> DEPLOY NEW APP
                        </button>
                        <button onClick={() => navigate('/dashboard')} className="btn btn-outline" style={{ padding: '16px 48px', fontSize: '1rem' }}>
                            <FiTerminal /> VIEW DASHBOARD
                        </button>
                    </div>
                </motion.div>
            </div>

            {/* Metrics Section */}
            <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
                gap: '30px', 
                marginBottom: '80px' 
            }}>
                {[
                    { label: 'PLATFORM UPTIME', value: '99.99%', sub: 'NOMINAL PERFORMANCE' },
                    { label: 'AVG BUILD VELOCITY', value: '3.2 SEC', sub: 'OPTIMIZED PIPELINE' },
                    { label: 'AI DIAGNOSTIC RATE', value: '98.4%', sub: 'INTELLIGENT ANALYSIS' }
                ].map((stat, i) => (
                    <motion.div
                        key={i}
                        initial={{ y: 20, opacity: 0 }}
                        whileInView={{ y: 0, opacity: 1 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.1 }}
                        className="glass"
                        style={{ 
                            padding: '40px 30px', 
                            textAlign: 'center', 
                            borderBottom: '4px solid var(--primary)',
                            background: 'rgba(0,0,0,0.3)'
                        }}
                    >
                        <div style={{ fontSize: '0.7rem', color: 'var(--text-dim)', letterSpacing: '3px', marginBottom: '15px', fontWeight: 800 }}>{stat.label}</div>
                        <div style={{ fontSize: '2.5rem', fontWeight: 800, color: 'white', fontFamily: 'Outfit' }}>{stat.value}</div>
                        <div style={{ fontSize: '0.65rem', color: 'var(--primary)', marginTop: '8px', letterSpacing: '2px', fontWeight: 700 }}>{stat.sub}</div>
                    </motion.div>
                ))}
            </div>

            {/* Features Title */}
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h2 style={{ fontSize: '1.5rem', letterSpacing: '4px' }}>SYSTEM CAPABILITIES</h2>
            </div>

            {/* Features Grid */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
                gap: '24px'
            }}>
                {features.map((f, i) => (
                    <div key={i} className="glass" style={{ padding: '40px', border: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            background: 'rgba(0, 242, 255, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '30px',
                            color: 'var(--primary)',
                            border: '1px solid var(--primary-glow)',
                            clipPath: 'polygon(15% 0%, 85% 0%, 100% 15%, 100% 85%, 85% 100%, 15% 100%, 0% 85%, 0% 15%)'
                        }}>
                            {React.cloneElement(f.icon, { size: 24 })}
                        </div>
                        <h3 style={{ marginBottom: '15px', fontSize: '1.2rem', letterSpacing: '1px' }}>{f.title.toUpperCase()}</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.9rem', lineHeight: 1.7 }}>{f.desc}</p>
                    </div>
                ))}
            </div>

            <style>{`
                @keyframes scan {
                    0% { background-position: 0% -100%; }
                    100% { background-position: 0% 100%; }
                }
            `}</style>
        </div>
    );
};

export default LandingPage;
