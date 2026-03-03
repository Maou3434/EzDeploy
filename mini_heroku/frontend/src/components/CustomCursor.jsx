import React, { useEffect, useState } from 'react';
import { motion, useSpring, useMotionValue } from 'framer-motion';

const CustomCursor = () => {
    const [isHovering, setIsHovering] = useState(false);
    const cursorX = useMotionValue(-100);
    const cursorY = useMotionValue(-100);

    const springConfig = { damping: 25, stiffness: 250 };
    const cursorXSpring = useSpring(cursorX, springConfig);
    const cursorYSpring = useSpring(cursorY, springConfig);

    useEffect(() => {
        const moveCursor = (e) => {
            cursorX.set(e.clientX);
            cursorY.set(e.clientY);
        };

        const handleHoverStart = (e) => {
            const target = e.target;
            if (
                target.tagName === 'BUTTON' ||
                target.tagName === 'A' ||
                target.closest('button') ||
                target.closest('a') ||
                target.classList.contains('nav-link') ||
                target.classList.contains('glass')
            ) {
                setIsHovering(true);
            }
        };

        const handleHoverEnd = () => setIsHovering(false);

        window.addEventListener('mousemove', moveCursor);
        window.addEventListener('mouseover', handleHoverStart);
        window.addEventListener('mouseout', handleHoverEnd);

        return () => {
            window.removeEventListener('mousemove', moveCursor);
            window.removeEventListener('mouseover', handleHoverStart);
            window.removeEventListener('mouseout', handleHoverEnd);
        };
    }, [cursorX, cursorY]);

    return (
        <>
            <motion.div
                style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)',
                    pointerEvents: 'none',
                    zIndex: 9999,
                    translateX: cursorXSpring,
                    translateY: cursorYSpring,
                    x: -10,
                    y: -10,
                    mixBlendMode: 'difference',
                }}
                animate={{
                    scale: isHovering ? 2.5 : 1,
                    opacity: 0.8,
                }}
            />
            <motion.div
                style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    width: 40,
                    height: 40,
                    borderRadius: '50%',
                    border: '1px solid var(--primary)',
                    pointerEvents: 'none',
                    zIndex: 9998,
                    translateX: cursorXSpring,
                    translateY: cursorYSpring,
                    x: -20,
                    y: -20,
                }}
                animate={{
                    scale: isHovering ? 1.5 : 1,
                    opacity: isHovering ? 0 : 0.3,
                }}
                transition={{ duration: 0.3 }}
            />
        </>
    );
};

export default CustomCursor;
