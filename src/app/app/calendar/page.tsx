"use client";
import React, { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import type { PlatformType, EditorialItem } from '@/types';
import { Calendar, Clock, Plus, Filter, Trash2 } from 'lucide-react';
import { Linkedin, Twitter, Instagram } from '@/components/icons';

export default function DetailedCalendarPage() {
  const { scheduledItems, handleAddScheduledItem, handleDeleteScheduledItem } = useAppContext();
  const [filterPlatform, setFilterPlatform] = useState<PlatformType | 'all'>('all');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newPlatform, setNewPlatform] = useState<PlatformType>('linkedin');
  const [newDay, setNewDay] = useState<string>('Seg');
  const [newTime, setNewTime] = useState<string>('09:00');
  const [showAddForm, setShowAddForm] = useState<boolean>(false);

  // Filters items by selected platform
  const filteredItems = scheduledItems.filter(item => 
    filterPlatform === 'all' ? true : item.platform === filterPlatform
  );

  const getPlatformIcon = (platform: string) => {
    switch (platform) {
      case 'linkedin': return <Linkedin className="h-4 w-4 text-[#0077b5]" />;
      case 'x': return <Twitter className="h-4 w-4 text-white" />;
      case 'instagram': return <Instagram className="h-4 w-4 text-[#e1306c]" />;
      default: return null;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'published':
        return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400">Publicado</span>;
      case 'scheduled':
        return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-accent-cyan/10 border border-accent-cyan/20 text-accent-cyan">Agendado</span>;
      case 'draft':
      default:
        return <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-dark-muted">Rascunho</span>;
    }
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const daysNumbersMap: Record<string, number> = {
      'Seg': 8, 'Ter': 9, 'Qua': 10, 'Qui': 11, 'Sex': 12, 'Sáb': 13, 'Dom': 14
    };

    const newItem: EditorialItem = {
      id: Math.random().toString(36).substr(2, 9),
      day: newDay,
      dayNumber: daysNumbersMap[newDay] || 8,
      platform: newPlatform,
      time: newTime,
      title: newTitle,
      status: 'scheduled',
    };

    handleAddScheduledItem(newItem);
    setNewTitle('');
    setShowAddForm(false);
  };

  return (
    <div className="flex-1 space-y-8 max-w-5xl mx-auto py-4 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1">
          <span className="text-[10px] tracking-widest font-extrabold text-accent-pink uppercase">Calendário</span>
          <h2 className="font-display text-2xl font-bold text-white tracking-tight">Cronograma de Publicações</h2>
          <p className="text-xs text-dark-muted">Gerencie o agendamento de postagens do estúdio</p>
        </div>

        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="relative group overflow-hidden rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-black hover:text-white border border-white/10 flex items-center justify-center gap-1.5 self-start sm:self-auto"
        >
          <div className="absolute inset-0 -z-10 bg-gradient-to-r from-accent-purple to-accent-cyan opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
          <Plus className="h-4 w-4" />
          <span>Agendar Novo Post</span>
        </button>
      </div>

      {/* Add Post Modal / Form Overlay */}
      {showAddForm && (
        <form onSubmit={handleCreateItem} className="glass-panel p-6 rounded-3xl border border-white/5 bg-[#0d0f17]/90 space-y-4 max-w-xl animate-fade-in">
          <h3 className="font-display text-sm font-bold text-white tracking-tight">Agendar Conteúdo</h3>
          
          <div className="space-y-1">
            <label className="text-[10px] uppercase font-bold text-dark-muted tracking-wider">Título da Postagem</label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="interactive-input"
              placeholder="Ex: 5 erros fatais de SEO em blogs"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {/* Platform selection */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-dark-muted tracking-wider">Rede</label>
              <select
                value={newPlatform}
                onChange={(e) => setNewPlatform(e.target.value as PlatformType)}
                className="interactive-input bg-dark-bg text-xs"
              >
                <option value="linkedin">LinkedIn</option>
                <option value="x">X / Twitter</option>
                <option value="instagram">Instagram</option>
              </select>
            </div>

            {/* Day selection */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-dark-muted tracking-wider">Dia da Semana</label>
              <select
                value={newDay}
                onChange={(e) => setNewDay(e.target.value)}
                className="interactive-input bg-dark-bg text-xs"
              >
                <option value="Seg">Segunda (08)</option>
                <option value="Ter">Terça (09)</option>
                <option value="Qua">Quarta (10)</option>
                <option value="Qui">Quinta (11)</option>
                <option value="Sex">Sexta (12)</option>
                <option value="Sáb">Sábado (13)</option>
                <option value="Dom">Domingo (14)</option>
              </select>
            </div>

            {/* Time selection */}
            <div className="space-y-1">
              <label className="text-[10px] uppercase font-bold text-dark-muted tracking-wider">Horário</label>
              <input
                type="text"
                value={newTime}
                onChange={(e) => setNewTime(e.target.value)}
                className="interactive-input text-xs"
                placeholder="Ex: 09:00"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={() => setShowAddForm(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-white transition-all"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-accent-cyan text-black hover:bg-white hover:text-black transition-all"
            >
              Confirmar
            </button>
          </div>
        </form>
      )}

      {/* Main Grid: Filters & Listing */}
      <div className="glass-panel rounded-3xl p-6 border border-white/5 space-y-6">
        {/* Filters bar */}
        <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-white/5">
          <div className="flex items-center gap-2 text-xs font-bold text-white">
            <Filter className="h-4 w-4 text-accent-cyan" />
            <span>Filtrar por Rede</span>
          </div>

          <div className="flex gap-2">
            {[
              { id: 'all', name: 'Todos' },
              { id: 'linkedin', name: 'LinkedIn' },
              { id: 'x', name: 'X / Twitter' },
              { id: 'instagram', name: 'Instagram' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setFilterPlatform(tab.id as PlatformType | 'all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all border ${
                  filterPlatform === tab.id
                    ? 'bg-accent-purple text-white border-accent-purple/30'
                    : 'bg-white/5 border-white/5 text-dark-muted hover:text-white hover:bg-white/10'
                }`}
              >
                {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Detailed List */}
        <div className="space-y-3">
          {filteredItems.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-white/5 rounded-2xl">
              <p className="text-sm text-dark-muted">Nenhum post agendado nesta categoria</p>
            </div>
          ) : (
            filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-white/[0.01] hover:bg-white/[0.03] border border-white/5 hover:border-white/10 p-4 rounded-2xl flex items-center justify-between gap-4 transition-all"
              >
                <div className="flex items-center gap-3.5 overflow-hidden">
                  {/* Platform Indicator */}
                  <div className="p-2.5 rounded-xl bg-black/40 border border-white/5">
                    {getPlatformIcon(item.platform)}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-white truncate max-w-[200px] sm:max-w-md">{item.title}</h4>
                    <div className="flex items-center gap-3 text-[10px] text-dark-muted mt-1">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        <span>{item.day} (Junho)</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        <span>{item.time}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-4 flex-shrink-0">
                  {getStatusBadge(item.status)}
                  <button
                    onClick={() => handleDeleteScheduledItem(item.id)}
                    className="p-1.5 rounded-lg border border-white/5 bg-white/5 text-rose-400 hover:text-white hover:bg-rose-600 transition-all"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
