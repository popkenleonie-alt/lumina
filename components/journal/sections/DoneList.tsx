'use client';

import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import { cn } from '@/lib/utils';
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
      { id: `item-${Date.now()}`, text: newItem.trim(), checked: false },
    ]);
    setNewItem('');
  };

  const toggleItem = (id: string) => {
    onChange(
      items.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div
          key={item.id}
          className="flex items-center gap-3 p-2 rounded-lg bg-white/50 group"
        >
          <button
            onClick={() => !readOnly && toggleItem(item.id)}
            disabled={readOnly}
            className={cn(
              'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors',
              item.checked
                ? 'bg-emerald-400 border-emerald-400'
                : 'border-emerald-300 hover:border-emerald-400'
            )}
          >
            {item.checked && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <span
            className={cn(
              'flex-1 text-sm transition-all',
              item.checked && 'line-through text-muted-foreground'
            )}
          >
            {item.text}
          </span>
          {!readOnly && (
            <button
              onClick={() => removeItem(item.id)}
              className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-black/5 transition-all"
            >
              <X className="w-4 h-4 text-muted-foreground" />
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
            placeholder="Add new item..."
            className="flex-1 px-3 py-2 rounded-lg bg-white/60 border border-emerald-200/50 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-emerald-300"
          />
          <button
            onClick={addItem}
            className="px-3 py-2 rounded-lg bg-emerald-100 text-emerald-600 hover:bg-emerald-200 transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
