import React from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';

const Background = () => {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 500], [0, 200]);
  const y2 = useTransform(scrollY, [0, 500], [0, -150]);
  const rotate = useTransform(scrollY, [0, 1000], [0, 45]);

  return (
    <div className="bg-scene">
      <motion.div
        className="bg-glow-1"
        style={{ y: y1, rotate }}
      />
      <motion.div
        className="bg-glow-2"
        style={{ y: y2, rotate: -rotate }}
      />
      <div className="bg-grid"></div>
    </div>
  );
};

export default Background;
