"use client";
import React from 'react';
import { motion, useInView, type TargetAndTransition } from 'framer-motion';
import { useRef } from 'react';
import type { ReactNode } from 'react';

type VariantPair = { hidden: TargetAndTransition; visible: TargetAndTransition };

const VARIANTS: Record<string, VariantPair> = {
  up:    { hidden: { opacity: 0, y: 28, filter: 'blur(5px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)' } },
  down:  { hidden: { opacity: 0, y: -28, filter: 'blur(5px)' }, visible: { opacity: 1, y: 0, filter: 'blur(0px)' } },
  left:  { hidden: { opacity: 0, x: 28, filter: 'blur(5px)' }, visible: { opacity: 1, x: 0, filter: 'blur(0px)' } },
  right: { hidden: { opacity: 0, x: -28, filter: 'blur(5px)' }, visible: { opacity: 1, x: 0, filter: 'blur(0px)' } },
  scale: { hidden: { opacity: 0, scale: 0.92, filter: 'blur(5px)' }, visible: { opacity: 1, scale: 1, filter: 'blur(0px)' } },
};

interface RevealProps {
  children: ReactNode;
  delay?: number;
  className?: string;
  from?: 'up' | 'down' | 'left' | 'right' | 'scale';
}

export const Reveal: React.FC<RevealProps> = ({ children, delay = 0, className = '', from = 'up' }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-8% 0px' });
  const { hidden, visible } = VARIANTS[from];

  return (
    <motion.div
      ref={ref}
      initial={hidden}
      animate={isInView ? visible : hidden}
      transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1], delay: delay / 1000 }}
      className={className}
    >
      {children}
    </motion.div>
  );
};
