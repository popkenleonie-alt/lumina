'use client';

import { useState } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';
import type { BeliefEntry } from '@/hooks/useJournalStore';

interface BeliefsProps {
  entries: BeliefEntry[];
  onChange: (entries: BeliefEntry[]) => void;
  readOnly?: boolean;
}

export function Beliefs({ entries, onChange, readOnly }: BeliefsProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addEntry = () => {
    const newEntry: BeliefEntry = {
      id: `belief-${Date.now()}`,
      belief: '',
      challenge: '',
      reframe: '',
    };
    onChange([...entries, newEntry]);
    setExpandedId(newEntry.id);
  };

  const updateEntry = (id: string, field: keyof Omit<BeliefEntry, 'id'>, value: string) => {
    onChange(entries.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const removeEntry = (id: string) => {
    onChange(entries.filter((e) => e.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-3">
      {entries.map((entry) => {
        const isExpanded = expandedId === entry.id;
        const preview = entry.belief || 'New belief...';

        return (
          <div
            key={entry.id}
            className="rounded-xl bg-white/5 border border-violet-500/20 overflow-hidden"
          >
            {/* Collapsed header */}
            <button
              type="button"
              onClick={() => toggleExpand(entry.id)}
              className="w-full flex items-center justify-between px-3 py-2.5 text-left"
            >
              <span className="text-sm text-violet-200 truncate pr-2">
                {preview}
              </span>
              {isExpanded ? (
                <ChevronUp className="w-4 h-4 text-violet-400 shrink-0" />
              ) : (
                <ChevronDown className="w-4 h-4 text-violet-400 shrink-0" />
              )}
            </button>

            {/* Expanded form */}
            {isExpanded && (
              <div className="px-3 pb-3 space-y-3 border-t border-violet-500/10">
                <div className="pt-3">
                  <label className="text-xs font-medium text-violet-400 mb-1 block">
                    I notice I believe...
                  </label>
                  <textarea
                    value={entry.belief}
                    onChange={(e) => updateEntry(entry.id, 'belief', e.target.value)}
                    placeholder="The thought or belief you noticed"
                    disabled={readOnly}
                    rows={2}
                    className="w-full p-2.5 rounded-lg bg-white/5 border border-violet-500/20 text-violet-100 text-sm placeholder:text-violet-400/40 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-amber-400 mb-1 block">
                    Is that really true?
                  </label>
                  <textarea
                    value={entry.challenge}
                    onChange={(e) => updateEntry(entry.id, 'challenge', e.target.value)}
                    placeholder="Challenge the belief — what evidence says otherwise?"
                    disabled={readOnly}
                    rows={2}
                    className="w-full p-2.5 rounded-lg bg-white/5 border border-amber-500/20 text-violet-100 text-sm placeholder:text-violet-400/40 resize-none focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-emerald-400 mb-1 block">
                    What I choose to believe instead
                  </label>
                  <textarea
                    value={entry.reframe}
                    onChange={(e) => updateEntry(entry.id, 'reframe', e.target.value)}
                    placeholder="A kinder, more empowering perspective"
                    disabled={readOnly}
                    rows={2}
                    className="w-full p-2.5 rounded-lg bg-white/5 border border-emerald-500/20 text-violet-100 text-sm placeholder:text-violet-400/40 resize-none focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                {!readOnly && (
                  <button
                    onClick={() => removeEntry(entry.id)}
                    className="flex items-center gap-1 text-xs text-red-400/70 hover:text-red-400 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    Remove
                  </button>
                )}
              </div>
            )}
          </div>
        );
      })}

      {!readOnly && (
        <button
          onClick={addEntry}
          className="w-full py-2.5 rounded-xl border border-dashed border-violet-500/30 text-violet-400 text-sm flex items-center justify-center gap-1.5 hover:bg-violet-500/10 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Add a belief
        </button>
      )}

      {entries.length === 0 && readOnly && (
        <p className="text-sm text-violet-400/50 text-center py-3">
          No beliefs recorded
        </p>
      )}
    </div>
  );
}
