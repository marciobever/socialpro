"use client";
import React from 'react';

interface RevealProps {
  children: React.ReactNode;
  /** Delay in ms before the reveal transition starts (used for stagger). */
  delay?: number;
  className?: string;
  /** Direction the content travels in from. */
  from?: 'up' | 'down' | 'left' | 'right' | 'scale';
}

const OFFSETS: Record<NonNullable<RevealProps['from']>, string> = {
  up: 'translate-y-8',
  down: '-translate-y-8',
  left: 'translate-x-8',
  right: '-translate-x-8',
  scale: 'scale-95',
};

/**
 * Reveals its children with a soft entrance the first time it scrolls
 * into view. Respects prefers-reduced-motion automatically (no observer
 * means it falls back to visible).
 */
export const Reveal: React.FC<RevealProps> = ({
  children,
  delay = 0,
  className = '',
  from = 'up',
}) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [shown, setShown] = React.useState(false);

  React.useEffect(() => {
    const node = ref.current;
    if (!node) return;

    if (typeof IntersectionObserver === 'undefined') {
      setShown(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setShown(true);
            observer.disconnect();
          }
        });
      },
      { threshold: 0.15, rootMargin: '0px 0px -10% 0px' }
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] will-change-transform ${
        shown ? 'opacity-100 translate-y-0 translate-x-0 scale-100' : `opacity-0 ${OFFSETS[from]}`
      } ${className}`}
    >
      {children}
    </div>
  );
};
