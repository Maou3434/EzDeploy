import React from 'react';
import { motion } from 'framer-motion';
import { FiArrowRight, FiZap, FiShield, FiGlobe, FiCode, FiLayers } from 'react-icons/fi';
import { Link } from 'react-router-dom';

const LandingPage = () => {
    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.3
            }
        }
    };

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.8, ease: [0.22, 1, 0.36, 1] } }
    };

    const features = [
        { icon: <FiZap />, title: 'Sonic Deployment', desc: 'Go from code to production in seconds with our optimized build engine.' },
        { icon: <FiShield />, title: 'Enterprise Core', desc: 'Secure by design, with automated isolation and resource management.' },
        { icon: <FiGlobe />, title: 'Global Edge', desc: 'Instantly accessible applications with automated port mapping and ingress.' },
        { icon: <FiCode />, title: 'Built-in DevX', desc: 'Integrated browser editor with real-time feedback and iterative redeploys.' },
        { icon: <FiLayers />, title: 'PaaS Transparency', desc: 'Full visibility into every stage of the deployment pipeline.' },
    ];

    return (
        <div style={{ padding: '60px 20px' }}>
            {/* Hero Section */}
            <motion.div
                variants={container}
                initial="hidden"
                animate="show"
                style={{ textAlign: 'center', maxWidth: '900px', margin: '0 auto', marginBottom: '100px' }}
            >
                <motion.div variants={item} style={{
                    margin: '0 auto 24px',
                    padding: '8px 16px',
                    borderRadius: '50px',
                    background: 'rgba(0, 242, 255, 0.05)',
                    border: '1px solid rgba(0, 242, 255, 0.1)',
                    display: 'inline-block',
                    fontSize: '0.85rem',
                    color: 'var(--primary)',
                    letterSpacing: '2px',
                    fontWeight: 600
                }}>
                    VERSION 2.0 IS LIVE
                </motion.div>

                <motion.h1 variants={item} style={{
                    fontSize: 'clamp(3rem, 8vw, 5.5rem)',
                    lineHeight: 1.05,
                    marginBottom: '24px',
                    fontWeight: 800
                }}>
                    Simple Deployments, <br />
                    <span className="glow-text">Infinite Velocity.</span>
                </motion.h1>

                <motion.p variants={item} style={{
                    fontSize: '1.25rem',
                    color: 'var(--text-dim)',
                    marginBottom: '40px',
                    lineHeight: 1.6,
                    maxWidth: '650px',
                    margin: '0 auto 40px'
                }}>
                    Experience the next generation of cloud orchestration. <br />
                    EzDeploy provides a transparent, iterative PaaS framework that handles the complexity so you can focus on building.
                </motion.p>

                <motion.div variants={item} style={{ display: 'flex', gap: '16px', justifyContent: 'center' }}>
                    <Link to="/deploy" className="btn btn-primary" style={{ fontSize: '1.1rem', padding: '16px 36px' }}>
                        Start Deploying <FiArrowRight />
                    </Link>
                    <Link to="/dashboard" className="btn btn-outline" style={{ fontSize: '1.1rem', padding: '16px 36px' }}>
                        View Dashboard
                    </Link>
                </motion.div>
            </motion.div>

            {/* Features Grid */}
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8 }}
                style={{
                    display: 'grid',
                    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
                    gap: '24px',
                    maxWidth: '1200px',
                    margin: '0 auto'
                }}
            >
                {features.map((f, i) => (
                    <div key={i} className="glass" style={{ padding: '32px', border: '1px solid var(--glass-border)' }}>
                        <div style={{
                            width: '48px',
                            height: '48px',
                            borderRadius: '12px',
                            background: 'rgba(255, 255, 255, 0.05)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            marginBottom: '24px',
                            color: 'var(--primary)'
                        }}>
                            {React.cloneElement(f.icon, { size: 24 })}
                        </div>
                        <h3 style={{ marginBottom: '12px', fontSize: '1.25rem' }}>{f.title}</h3>
                        <p style={{ color: 'var(--text-dim)', fontSize: '0.95rem', lineHeight: 1.6 }}>{f.desc}</p>
                    </div>
                ))}
            </motion.div>
        </div>
    );
};

export default LandingPage;
