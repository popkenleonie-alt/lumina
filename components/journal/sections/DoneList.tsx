'use client';

import { useState } from 'react';
import { Plus, Check, X, Clock } from 'lucide-react';
import type { ChecklistItem } from '@/hooks/useJournalStore';

interface DoneListProps {
  items: ChecklistItem[];
  onChange: (items: ChecklistItem[]) => void;
  readOnly?: boolean;
}

export function DoneList({ items, onChange, readOnly }: DoneListProps) {
  const [newItem, setNewItem] = useState('');

  const addItem = () => {
    if (!newItem.trim()) return;
    onChange([
      ...items,
      { id: `item-${Date.now()}`, text: newItem.trim(), checked: true, timestamp: new Date().toISOString() },
    ]);
    setNewItem('');
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 p-2 rounded-lg bg-white/5 group"
        >
          <div className="w-5 h-5 rounded-md bg-emerald-400 flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 text-white" strokeWidth={3} />
          </div>
          <div className="flex-1 min-w-0">
            <span className="text-sm text-violet-100">{item.text}</span>
            {item.timestamp && (
              <div className="flex items-center gap-1 mt-0.5">
                <Clock className="w-3 h-3 text-violet-400/50" />
                <span className="text-[10px] text-violet-400/50">
                  {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            )}
          </div>
          {!readOnly && (
            <button
              onClick={() => removeItem(item.id)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10 transition-all"
            >
              <X className="w-4 h-4 text-violet-400" />
            </button>
          )}
        </div>
      ))}
      {!readOnly && (
        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder="Add something you did..."
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-violet-500/20 text-sm text-violet-100 placeholder:text-violet-400/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
          <button
            onClick={addItem}
            className="px-3 py-2 rounded-lg bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
