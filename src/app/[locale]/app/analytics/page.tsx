"use client";
import React from 'react';
import { TrendingUp, Eye, Heart, Share2, Award, Zap } from 'lucide-react';

interface MetricDetail {
  name: string;
  value: string;
  change: string;
  status: 'up' | 'down';
  icon: React.ComponentType<any>;
  color: string;
}

const DETAIL_METRICS: MetricDetail[] = [
  { name: 'Impressões de Feed', value: '348,250', change: '+34.2%', status: 'up', icon: Eye, color: 'text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20' },
  { name: 'Engajamento Total', value: '24,812', change: '+18.7%', status: 'up', icon: Heart, color: 'text-accent-pink bg-accent-pink/10 border-accent-pink/20' },
  { name: 'Taxa de Compartilhamento', value: '4.8%', change: '+12.4%', status: 'up', icon: Share2, color: 'text-accent-purple bg-accent-purple/10 border-accent-purple/20' },
  { name: 'Cliques em Links', value: '1,984', change: '-2.1%', status: 'down', icon: Zap, color: 'text-accent-orange bg-accent-orange/10 border-accent-orange/20' },
];

export default function DetailedAnalyticsPage() {
  return (
    <div className="flex-1 space-y-8 max-w-5xl mx-auto py-4 animate-fade-in">
      {/* Header */}
      <div className="space-y-1">
        <span className="text-[10px] tracking-widest font-extrabold text-accent-cyan uppercase">Estatísticas</span>
        <h2 className="font-display text-2xl font-bold text-white tracking-tight">Analytics Pro</h2>
        <p className="text-xs text-dark-muted">Monitore a performance de conversão e impressões estimadas</p>
      </div>

      {/* Grid of detail stats cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {DETAIL_METRICS.map((metric) => {
          const Icon = metric.icon;
          return (
            <div key={metric.name} className="glass-panel p-5 rounded-3xl border border-white/5 bg-white/[0.01] flex flex-col justify-between space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-dark-muted font-bold truncate">{metric.name}</span>
                <div className={`p-2 rounded-xl border ${metric.color}`}>
                  <Icon className="h-4 w-4" />
                </div>
              </div>
              <div>
                <span className="text-xl font-bold text-white tracking-tight">{metric.value}</span>
                <span className={`text-[10px] font-extrabold ml-1.5 ${
                  metric.status === 'up' ? 'text-emerald-400' : 'text-rose-400'
                }`}>{metric.change}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Grid of charts (Line & Bar) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        
        {/* Line Chart Card (Impressions) */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-display text-sm font-bold text-white tracking-tight">Crescimento de Impressões (Junho)</h3>
            <div className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-2 py-0.5 rounded-lg flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +32%
            </div>
          </div>
          
          <div className="h-44 w-full bg-white/[0.01] border border-white/5 rounded-2xl p-2 relative overflow-hidden">
            <svg className="w-full h-full" viewBox="0 0 300 100" preserveAspectRatio="none">
              <defs>
                <linearGradient id="lineGlow" x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%" stopColor="#8b5cf6" />
                  <stop offset="100%" stopColor="#22d3ee" />
                </linearGradient>
                <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#22d3ee" stopOpacity="0.2" />
                  <stop offset="100%" stopColor="#22d3ee" stopOpacity="0" />
                </linearGradient>
              </defs>
              <line x1="0" y1="25" x2="300" y2="25" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="50" x2="300" y2="50" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />
              <line x1="0" y1="75" x2="300" y2="75" stroke="rgba(255,255,255,0.03)" strokeWidth="1" />

              {/* Path & area */}
              <path d="M 10 90 L 50 75 L 100 85 L 150 45 L 200 35 L 250 15 L 290 5 L 290 100 L 10 100 Z" fill="url(#areaFill)" />
              <path d="M 10 90 L 50 75 L 100 85 L 150 45 L 200 35 L 250 15 L 290 5" fill="none" stroke="url(#lineGlow)" strokeWidth="3" strokeLinecap="round" />
            </svg>
          </div>
        </div>

        {/* Bar Chart Card (Reach by channel) */}
        <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
          <h3 className="font-display text-sm font-bold text-white tracking-tight">Alcance Estimado por Rede</h3>
          <div className="h-44 w-full bg-white/[0.01] border border-white/5 rounded-2xl p-4 flex items-end justify-around relative">
            
            {/* LinkedIn bar */}
            <div className="flex flex-col items-center w-12 space-y-2">
              <span className="text-[10px] text-white font-bold">145k</span>
              <div className="w-6 bg-gradient-to-t from-accent-purple to-accent-cyan rounded-t-lg h-24 shadow-[0_0_12px_rgba(6,182,212,0.2)]"></div>
              <span className="text-[9px] text-dark-muted font-bold">LinkedIn</span>
            </div>

            {/* Instagram bar */}
            <div className="flex flex-col items-center w-12 space-y-2">
              <span className="text-[10px] text-white font-bold">92k</span>
              <div className="w-6 bg-gradient-to-t from-accent-pink to-accent-purple rounded-t-lg h-16 shadow-[0_0_12px_rgba(244,63,94,0.2)]"></div>
              <span className="text-[9px] text-dark-muted font-bold">Instagram</span>
            </div>

            {/* X Twitter bar */}
            <div className="flex flex-col items-center w-12 space-y-2">
              <span className="text-[10px] text-white font-bold">58k</span>
              <div className="w-6 bg-white/10 rounded-t-lg h-10 border border-white/5"></div>
              <span className="text-[9px] text-dark-muted font-bold">X / Twitter</span>
            </div>

          </div>
        </div>

      </div>

      {/* Top Performing Publications table */}
      <div className="glass-panel p-6 rounded-3xl border border-white/5 space-y-4">
        <div className="flex items-center gap-2 pb-3 border-b border-white/5">
          <div className="p-2 bg-accent-purple/10 border border-accent-purple/20 text-accent-purple rounded-xl">
            <Award className="h-4.5 w-4.5" />
          </div>
          <h3 className="font-display text-sm font-bold text-white tracking-tight">Conteúdo de Melhor Performance</h3>
        </div>

        <div className="space-y-3">
          {[
            { title: 'Como ajudei uma startup de SaaS a ir de zero a $20k MRR', platform: 'LinkedIn', views: '42.8k', clicks: '1.2k', ctr: '3.1%' },
            { title: 'A maioria dos criadores está perdendo tempo...', platform: 'LinkedIn', views: '28.1k', clicks: '890', ctr: '2.8%' },
            { title: 'Os Maiores Erros que Cometi na minha Agência', platform: 'Instagram', views: '19.5k', clicks: '640', ctr: '2.5%' },
          ].map((item, idx) => (
            <div key={idx} className="bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 transition-all">
              <div className="overflow-hidden">
                <span className="text-[8px] font-extrabold uppercase px-2 py-0.5 rounded bg-white/5 text-accent-cyan border border-white/5">{item.platform}</span>
                <h4 className="text-xs font-bold text-white truncate max-w-sm mt-1">{item.title}</h4>
              </div>
              
              <div className="flex gap-6 text-right">
                <div>
                  <span className="text-[9px] text-dark-muted block">Visto</span>
                  <span className="text-xs font-bold text-white">{item.views}</span>
                </div>
                <div>
                  <span className="text-[9px] text-dark-muted block">Cliques</span>
                  <span className="text-xs font-bold text-white">{item.clicks}</span>
                </div>
                <div>
                  <span className="text-[9px] text-dark-muted block">CTR</span>
                  <span className="text-xs font-bold text-accent-cyan">{item.ctr}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
