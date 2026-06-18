import React, { useState } from 'react';
import { BarChart2, TrendingUp, Eye, Heart, Share2 } from 'lucide-react';

interface Metric {
  name: string;
  value: string;
  change: string;
  icon: React.ComponentType<any>;
  color: string;
}

const METRICS: Metric[] = [
  { name: 'Impressões', value: '142.8K', change: '+24%', icon: Eye, color: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20' },
  { name: 'Reações / Likes', value: '12.4K', change: '+18%', icon: Heart, color: 'text-accent-pink bg-accent-pink/10 border-accent-pink/20' },
  { name: 'Compartilhados', value: '3.1K', change: '+32%', icon: Share2, color: 'text-accent-purple bg-accent-purple/10 border-accent-purple/20' },
];

export const AnalyticsCard: React.FC = () => {
  const [hoveredPoint, setHoveredPoint] = useState<{ x: number; y: number; val: string } | null>(null);

  // SVG Chart path parameters
  // x-coords: 0, 40, 80, 120, 160, 200, 240, 280
  // y-coords (inverted: 0 is top, 80 is bottom)
  const chartPoints = [
    { x: 10, y: 70, val: '8.4k' },
    { x: 50, y: 65, val: '9.2k' },
    { x: 90, y: 40, val: '14.8k' },
    { x: 130, y: 55, val: '11.2k' },
    { x: 170, y: 20, val: '22.5k' },
    { x: 210, y: 30, val: '19.1k' },
    { x: 250, y: 15, val: '24.8k' },
    { x: 290, y: 5, val: '29.4k' },
  ];

  // Build the SVG path string (cubic bezier smooth path or straight lines)
  const pathD = chartPoints.reduce((acc, point, index) => {
    return index === 0 ? `M ${point.x} ${point.y}` : `${acc} L ${point.x} ${point.y}`;
  }, '');

  // Build the filled area path for background gradient
  const areaD = `${pathD} L 290 80 L 10 80 Z`;

  return (
    <div className="glass-panel bento-card p-6 rounded-3xl col-span-1 lg:col-span-1 row-span-1 flex flex-col justify-between min-h-[220px]">
      <div className="space-y-3 w-full">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan rounded-xl">
              <BarChart2 className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-white tracking-tight">Analytics de Engajamento</h3>
              <p className="text-[11px] text-dark-muted">Desempenho projetado do post</p>
            </div>
          </div>
          <div className="flex items-center gap-1 text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg">
            <TrendingUp className="h-3 w-3" /> +28.4%
          </div>
        </div>

        {/* Mini stats cards */}
        <div className="grid grid-cols-3 gap-2 py-1">
          {METRICS.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.name} className="bg-white/5 border border-white/5 rounded-xl p-2 flex flex-col justify-between text-left">
                <div className="flex items-center justify-between">
                  <span className="text-[9px] text-dark-muted font-medium truncate">{metric.name}</span>
                  <div className={`p-1 rounded-md border ${metric.color} scale-90`}>
                    <Icon className="h-3 w-3" />
                  </div>
                </div>
                <div className="mt-1">
                  <span className="text-sm font-bold text-white tracking-tight">{metric.value}</span>
                  <span className="text-[8px] font-bold text-emerald-400 ml-1">{metric.change}</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Futuristic SVG Line Chart */}
        <div className="relative h-20 w-full mt-2 bg-white/[0.02] border border-white/5 rounded-2xl overflow-hidden p-1">
          <svg className="w-full h-full" viewBox="0 0 300 80" preserveAspectRatio="none">
            <defs>
              {/* Line Gradient */}
              <linearGradient id="chartGlow" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="50%" stopColor="#06b6d4" />
                <stop offset="100%" stopColor="#ec4899" />
              </linearGradient>
              {/* Filled Area Gradient */}
              <linearGradient id="areaGlow" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0" />
              </linearGradient>
            </defs>

            {/* Grid Lines */}
            <line x1="0" y1="20" x2="300" y2="20" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="0" y1="40" x2="300" y2="40" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
            <line x1="0" y1="60" x2="300" y2="60" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

            {/* Filled Area */}
            <path d={areaD} fill="url(#areaGlow)" />

            {/* Glowing Line */}
            <path d={pathD} fill="none" stroke="url(#chartGlow)" strokeWidth="2.5" strokeLinecap="round" />

            {/* Interactive Points */}
            {chartPoints.map((pt, idx) => (
              <circle
                key={idx}
                cx={pt.x}
                cy={pt.y}
                r="3"
                className="fill-dark-bg stroke-accent-cyan cursor-pointer hover:r-5 hover:fill-accent-pink hover:stroke-white transition-all duration-150"
                onMouseEnter={() => setHoveredPoint({ x: pt.x, y: pt.y, val: pt.val })}
                onMouseLeave={() => setHoveredPoint(null)}
              />
            ))}
          </svg>

          {/* Interactive Tooltip Overlay */}
          {hoveredPoint && (
            <div 
              style={{ 
                left: `${(hoveredPoint.x / 300) * 100}%`, 
                top: `${(hoveredPoint.y / 80) * 100 - 35}%` 
              }}
              className="absolute -translate-x-1/2 bg-black border border-white/20 text-white text-[9px] font-bold py-0.5 px-1.5 rounded shadow-lg pointer-events-none z-10 whitespace-nowrap"
            >
              Cliques: {hoveredPoint.val}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
