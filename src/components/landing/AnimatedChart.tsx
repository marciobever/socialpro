"use client";
import React from 'react';

// Engagement-style data points across a 300x110 viewbox.
const POINTS = [
  [0, 92],
  [50, 70],
  [100, 80],
  [150, 48],
  [200, 56],
  [250, 24],
  [300, 14],
];

const linePath = POINTS.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p[0]} ${p[1]}`).join(' ');
const areaPath = `${linePath} L 300 110 L 0 110 Z`;

/**
 * Animated SVG engagement chart for the landing page — the line draws
 * itself in, the area fades up, and a dot pulses at the latest peak.
 * Replays each time it re-enters the viewport via the `replayKey`.
 */
export const AnimatedChart: React.FC = () => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [replayKey, setReplayKey] = React.useState(0);

  React.useEffect(() => {
    const node = ref.current;
    if (!node || typeof IntersectionObserver === 'undefined') return;
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setReplayKey((k) => k + 1);
        });
      },
      { threshold: 0.3 }
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, []);

  const last = POINTS[POINTS.length - 1];

  return (
    <div ref={ref} className="w-full h-full flex flex-col justify-between p-1">
      <div className="flex justify-between items-center px-1">
        <span className="text-[10px] font-bold text-white">Engajamento estimado</span>
        <span className="text-[10px] font-bold text-emerald-400 flex items-center gap-1">
          ▲ +218%
        </span>
      </div>

      <svg viewBox="0 0 300 110" className="w-full" preserveAspectRatio="none" key={replayKey}>
        <defs>
          <linearGradient id="chart-area" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="chart-line" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#8b5cf6" />
            <stop offset="100%" stopColor="#22d3ee" />
          </linearGradient>
        </defs>

        {/* Faint grid lines */}
        {[27, 55, 82].map((y) => (
          <line key={y} x1="0" y1={y} x2="300" y2={y} stroke="rgba(255,255,255,0.05)" strokeWidth="1" />
        ))}

        {/* Area fill */}
        <path d={areaPath} fill="url(#chart-area)" className="chart-area-fill" />

        {/* Drawn line */}
        <path
          d={linePath}
          fill="none"
          stroke="url(#chart-line)"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="chart-line-draw"
        />

        {/* Pulsing latest-point marker */}
        <circle cx={last[0]} cy={last[1]} r="4.5" fill="#22d3ee" className="chart-dot">
          <animate attributeName="r" values="4.5;7;4.5" dur="1.8s" repeatCount="indefinite" />
          <animate attributeName="opacity" values="1;0.5;1" dur="1.8s" repeatCount="indefinite" />
        </circle>
      </svg>

      <div className="flex justify-between text-[8px] text-dark-muted px-1 font-medium">
        <span>Seg</span><span>Ter</span><span>Qua</span><span>Qui</span><span>Sex</span><span>Sáb</span><span>Dom</span>
      </div>
    </div>
  );
};
