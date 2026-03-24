'use client';

import React, { useState } from 'react';
import { Plus, Pencil, Trash2, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatDateKey, getDayName, isSameDayCheck, isTodayCheck } from '@/lib/dateHelpers';
import type { SportType } from '@/hooks/useSportTypes';

interface SportsOverviewProps {
  weekSports: Record<string, string[]>;
  weekDays: Date[];
  selectedDate: Date;
  sportTypes: SportType[];
  onToggleSport: (dateKey: string, sport: string) => void;
  onAddSportType: (label: string) => void;
  onUpdateSportType: (id: string, label: string) => void;
  onDeleteSportType: (id: string) => void;
}

export function SportsOverview({
  weekSports,
  weekDays,
  selectedDate,
  sportTypes,
  onToggleSport,
  onAddSportType,
  onUpdateSportType,
  onDeleteSportType,
}: SportsOverviewProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isAdding, setIsAdding] = useState(false);
  const [newLabel, setNewLabel] = useState('');

  const startEdit = (sport: SportType) => {
    setEditingId(sport.id);
    setEditValue(sport.label);
    setIsAdding(false);
  };

  const saveEdit = () => {
    if (editingId && editValue.trim()) {
      onUpdateSportType(editingId, editValue.trim());
    }
    setEditingId(null);
    setEditValue('');
  };

  const startAdd = () => {
    setIsAdding(true);
    setNewLabel('');
    setEditingId(null);
  };

  const saveAdd = () => {
    if (newLabel.trim()) {
      onAddSportType(newLabel.trim());
    }
    setIsAdding(false);
    setNewLabel('');
  };

  return (
    <div className="space-y-3">
      {/* Grid */}
      <div
        className="grid gap-y-1.5"
        style={{ gridTemplateColumns: 'auto repeat(7, 1fr)' }}
      >
        {/* Day headers */}
        <div />
        {weekDays.map(day => {
          const isSelected = isSameDayCheck(day, selectedDate);
          const isToday = isTodayCheck(day);
          return (
            <div key={day.toISOString()} className="flex justify-center">
              <span
                className={cn(
                  'text-[10px] font-medium w-7 text-center',
                  isSelected
                    ? 'text-violet-300'
                    : isToday
                      ? 'text-violet-400/70'
                      : 'text-violet-300/30',
                )}
              >
                {getDayName(day).charAt(0)}
              </span>
            </div>
          );
        })}

        {/* Sport rows */}
        {sportTypes.map(({ id, label }) => (
          <React.Fragment key={id}>
            {/* Sport label */}
            <div className="flex items-center pr-3 group/row gap-1">
              {editingId === id ? (
                <div className="flex items-center gap-1">
                  <input
                    autoFocus
                    value={editValue}
                    onChange={e => setEditValue(e.target.value)}
                    onKeyDown={e => {
                      if (e.key === 'Enter') saveEdit();
                      if (e.key === 'Escape') setEditingId(null);
                    }}
                    className="text-[11px] font-medium text-violet-200 bg-white/10 rounded px-1.5 py-0.5 w-20 outline-none focus:ring-1 focus:ring-violet-400/50"
                  />
                  <button onClick={saveEdit} className="text-emerald-400 hover:text-emerald-300">
                    <Check className="w-3 h-3" />
                  </button>
                  <button onClick={() => setEditingId(null)} className="text-violet-400/50 hover:text-violet-300">
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ) : (
                <>
                  <span className="text-[11px] font-medium text-violet-300/70 whitespace-nowrap">{label}</span>
                  <button
                    onClick={() => startEdit({ id, label })}
                    className="opacity-0 group-hover/row:opacity-100 text-violet-400/40 hover:text-violet-300 transition-opacity"
                  >
                    <Pencil className="w-2.5 h-2.5" />
                  </button>
                  <button
                    onClick={() => onDeleteSportType(id)}
                    className="opacity-0 group-hover/row:opacity-100 text-violet-400/40 hover:text-rose-400 transition-opacity"
                  >
                    <Trash2 className="w-2.5 h-2.5" />
                  </button>
                </>
              )}
            </div>

            {/* Day cells */}
            {weekDays.map(day => {
              const dk = formatDateKey(day);
              const daySports = weekSports[dk] ?? [];
              const active = daySports.includes(id);
              const isToday = isTodayCheck(day);

              return (
                <div key={`${id}-${dk}`} className="flex justify-center">
                  <button
                    onClick={() => onToggleSport(dk, id)}
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center transition-all duration-300',
                      active
                        ? 'bg-violet-500/20 shadow-[0_0_10px_rgba(139,92,246,0.35),0_0_20px_rgba(139,92,246,0.15)]'
                        : isToday
                          ? 'bg-white/[0.03] hover:bg-white/10'
                          : 'hover:bg-white/5',
                    )}
                  >
                    <div
                      className={cn(
                        'w-2 h-2 rounded-full transition-all duration-300',
                        active
                          ? 'bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.8)]'
                          : 'bg-white/10',
                      )}
                    />
                  </button>
                </div>
              );
            })}
          </React.Fragment>
        ))}
      </div>

      {/* Add sport type */}
      {isAdding ? (
        <div className="flex items-center gap-2">
          <input
            autoFocus
            value={newLabel}
            onChange={e => setNewLabel(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter') saveAdd();
              if (e.key === 'Escape') setIsAdding(false);
            }}
            placeholder="Sport name..."
            className="text-xs text-violet-200 bg-white/10 rounded-lg px-2.5 py-1.5 flex-1 outline-none focus:ring-1 focus:ring-violet-400/50 placeholder:text-violet-400/40"
          />
          <button
            onClick={saveAdd}
            disabled={!newLabel.trim()}
            className="text-emerald-400 hover:text-emerald-300 disabled:opacity-30"
          >
            <Check className="w-4 h-4" />
          </button>
          <button
            onClick={() => setIsAdding(false)}
            className="text-violet-400/50 hover:text-violet-300"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <button
          onClick={startAdd}
          className="flex items-center gap-1.5 text-violet-400/50 hover:text-violet-300 transition-colors text-xs"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add sport</span>
        </button>
      )}
    </div>
  );
}
