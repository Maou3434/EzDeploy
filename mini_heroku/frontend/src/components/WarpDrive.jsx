import React from 'react';
import { motion } from 'framer-motion';

const WarpDrive = () => {
  const particles = Array.from({ length: 40 });

  return (
    <div style={{
      position: 'absolute',
      top: 0,
      left: 0,
      width: '100%',
      height: '100%',
      overflow: 'hidden',
      background: 'radial-gradient(circle, rgba(0, 242, 255, 0.05) 0%, transparent 70%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: -1
    }}>
      {particles.map((_, i) => (
        <motion.div
          key={i}
          initial={{ 
            scale: 0, 
            x: 0, 
            y: 0, 
            opacity: 0,
            rotate: Math.random() * 360 
          }}
          animate={{
            scale: [0, 1.5, 3],
            x: (Math.random() - 0.5) * 1000,
            y: (Math.random() - 0.5) * 1000,
            opacity: [0, 0.8, 0],
          }}
          transition={{
            duration: 1 + Math.random() * 2,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: "easeIn"
          }}
          style={{
            position: 'absolute',
            width: '2px',
            height: '40px',
            background: 'linear-gradient(to top, transparent, var(--primary))',
            borderRadius: '2px',
          }}
        />
      ))}

      <motion.div
        animate={{
          scale: [0.8, 1.1, 0.8],
          opacity: [0.3, 0.6, 0.3],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{
          width: '300px',
          height: '300px',
          borderRadius: '50%',
          border: '2px solid var(--primary-glow)',
          filter: 'blur(20px)',
          boxShadow: '0 0 50px var(--primary-glow)'
        }}
      />
    </div>
  );
};

export default WarpDrive;
