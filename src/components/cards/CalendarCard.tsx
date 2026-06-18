import React, { useState } from 'react';
import type { EditorialItem } from '../../types';
import { Calendar, Clock, Plus } from 'lucide-react';
import { Linkedin, Twitter, Instagram } from '../icons';

interface CalendarCardProps {
  scheduledItems: EditorialItem[];
  onSelectItem: (item: EditorialItem) => void;
  selectedItemId?: string;
}

const DAYS = [
  { label: 'Seg', number: 8 },
  { label: 'Ter', number: 9 },
  { label: 'Qua', number: 10 },
  { label: 'Qui', number: 11 },
  { label: 'Sex', number: 12 },
  { label: 'Sáb', number: 13 },
  { label: 'Dom', number: 14 },
];

export const CalendarCard: React.FC<CalendarCardProps> = ({
  scheduledItems,
  onSelectItem,
  selectedItemId,
}) => {
  const [selectedDay, setSelectedDay] = useState<string>('Qua'); // default to Wednesday in our mockup list

  const filteredItems = scheduledItems.filter(item => item.day === selectedDay);

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin': return <Linkedin className="h-3.5 w-3.5 text-[#0077b5]" />;
      case 'x': return <Twitter className="h-3.5 w-3.5 text-white" />;
      case 'instagram': return <Instagram className="h-3.5 w-3.5 text-[#e1306c]" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Publicado</span>;
      case 'scheduled':
        return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan">Agendado</span>;
      case 'draft':
      default:
        return <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-full bg-white/5 border border-white/10 text-dark-muted">Rascunho</span>;
    }
  };

  return (
    <div className="glass-panel bento-card p-6 rounded-3xl col-span-1 lg:col-span-1 row-span-1 flex flex-col justify-between min-h-[220px]">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-accent-pink/10 border border-accent-pink/20 text-accent-pink rounded-xl">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-display text-base font-bold text-white tracking-tight">Calendário Editorial</h3>
              <p className="text-[11px] text-dark-muted">Organize seu fluxo semanal</p>
            </div>
          </div>

          <button className="p-1.5 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 text-white transition-all">
            <Plus className="h-3.5 w-3.5" />
          </button>
        </div>

        {/* Weekly Day Headers */}
        <div className="grid grid-cols-7 gap-1 bg-white/5 p-1 rounded-2xl border border-white/5">
          {DAYS.map((day) => {
            const isSelected = selectedDay === day.label;
            const hasItems = scheduledItems.some(item => item.day === day.label);
            
            return (
              <button
                key={day.label}
                onClick={() => setSelectedDay(day.label)}
                className={`flex flex-col items-center py-2 px-1 rounded-xl transition-all relative ${
                  isSelected 
                    ? 'bg-gradient-to-b from-accent-purple/20 to-accent-pink/20 border border-accent-purple/30 text-white shadow-inner' 
                    : 'hover:bg-white/5 text-dark-muted hover:text-white'
                }`}
              >
                <span className="text-[9px] font-semibold">{day.label}</span>
                <span className="text-xs font-bold mt-0.5">{day.number}</span>
                {hasItems && (
                  <span className="absolute bottom-1.5 h-1 w-1 rounded-full bg-accent-cyan"></span>
                )}
              </button>
            );
          })}
        </div>

        {/* Daily Schedule Items */}
        <div className="space-y-2 max-h-[140px] overflow-y-auto pr-1">
          {filteredItems.length === 0 ? (
            <div className="text-center py-6 border border-dashed border-white/5 rounded-2xl">
              <p className="text-xs text-dark-muted">Nenhum post agendado para hoje</p>
            </div>
          ) : (
            filteredItems.map((item) => {
              const isSelected = selectedItemId === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => onSelectItem(item)}
                  className={`group p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                    isSelected
                      ? 'border-accent-purple bg-accent-purple/5'
                      : 'bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10'
                  }`}
                >
                  <div className="flex items-center gap-2.5 overflow-hidden">
                    <div className="flex-shrink-0 p-1.5 rounded-lg bg-black/30 border border-white/5">
                      {getPlatformIcon(item.platform)}
                    </div>
                    <div className="overflow-hidden">
                      <h4 className="text-xs font-bold text-white truncate max-w-[120px] group-hover:text-accent-cyan transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-1 text-[10px] text-dark-muted mt-0.5">
                        <Clock className="h-3 w-3" />
                        <span>{item.time}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex-shrink-0">
                    {getStatusBadge(item.status)}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
};
