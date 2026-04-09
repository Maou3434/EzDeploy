import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import GalaxyBackground from './GalaxyBackground';

const Background = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const rotate = useTransform(scrollY, [0, 1000], [0, 45]);

  const lines = Array.from({ length: 15 });

  return (
    <div className="bg-scene">
      {/* 3D Particle Scene */}
      <GalaxyBackground />

      <motion.div
        className="bg-glow-1"
        style={{ y: y1, rotate }}
      />
      <motion.div
        className="bg-glow-2"
        style={{ y: y2, rotate: -rotate }}
      />

      {/* Flowing Lines */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', overflow: 'hidden' }}>
        {lines.map((_, i) => (
          <motion.div
            key={i}
            className="bg-line"
            initial={{ x: '-100%', top: `${i * 7}%`, opacity: 0 }}
            animate={{
              x: '100%',
              opacity: [0, 0.1, 0]
            }}
            transition={{
              duration: 10 + Math.random() * 20,
              repeat: Infinity,
              delay: Math.random() * 20,
              ease: "linear"
            }}
          />
        ))}
      </div>

      {/* Geometric Bounces */}
      <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
        {[...Array(5)].map((_, i) => (
          <motion.div
            key={i}
            style={{
              position: 'absolute',
              width: 100 + i * 50,
              height: 100 + i * 50,
              border: '1px solid var(--grid-color)',
              opacity: 0.1,
              borderRadius: i % 2 === 0 ? '50%' : '10px'
            }}
            animate={{
              x: [Math.random() * 100, Math.random() * 800, Math.random() * 100],
              y: [Math.random() * 100, Math.random() * 800, Math.random() * 100],
              rotate: [0, 360],
              scale: [1, 1.2, 1]
            }}
            transition={{
              duration: 20 + i * 5,
              repeat: Infinity,
              ease: "linear"
            }}
          />
        ))}
      </div>

      <div className="bg-grid"></div>
    </div>
  );
};

export default Background;
