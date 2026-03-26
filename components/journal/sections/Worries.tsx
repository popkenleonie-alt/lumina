'use client';

import { useState, useEffect } from 'react';
import { Plus, Trash2, ChevronDown, ChevronUp, History, Clock } from 'lucide-react';
import { format } from 'date-fns';
import type { WorryEntry } from '@/hooks/useJournalStore';
import { cn } from '@/lib/utils';

interface WorriesProps {
  entries: WorryEntry[];
  onChange: (entries: WorryEntry[]) => void;
  selectedDate: Date;
  readOnly?: boolean;
}

interface LookbackDay {
  dateKey: string;
  worries: WorryEntry[];
}

interface LookbackData {
  oneWeek: LookbackDay[];
  oneMonth: LookbackDay[];
  oneYear: LookbackDay[];
}

const PERIODS = [
  { key: 'oneWeek' as const, label: 'Past week' },
  { key: 'oneMonth' as const, label: 'Past month' },
  { key: 'oneYear' as const, label: 'Past year' },
];

export function Worries({ entries, onChange, selectedDate, readOnly }: WorriesProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showLookback, setShowLookback] = useState(false);
  const [lookbackData, setLookbackData] = useState<LookbackData | null>(null);
  const [lookbackLoading, setLookbackLoading] = useState(false);
  const [activePeriod, setActivePeriod] = useState<keyof LookbackData>('oneWeek');

  useEffect(() => {
    if (!showLookback) return;
    setLookbackLoading(true);
    const dateStr = format(selectedDate, 'yyyy-MM-dd');
    fetch(`/api/journal/worries-lookback?date=${dateStr}`)
      .then((res) => res.json())
      .then((data) => setLookbackData(data))
      .catch(() => setLookbackData(null))
      .finally(() => setLookbackLoading(false));
  }, [showLookback, selectedDate]);

  const addEntry = () => {
    const newEntry: WorryEntry = {
      id: `worry-${Date.now()}`,
      worry: '',
      worstCase: '',
      action: '',
    };
    onChange([...entries, newEntry]);
    setExpandedId(newEntry.id);
  };

  const updateEntry = (id: string, field: keyof Omit<WorryEntry, 'id'>, value: string) => {
    onChange(entries.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const removeEntry = (id: string) => {
    onChange(entries.filter((e) => e.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  const activeDays = lookbackData?.[activePeriod] ?? [];

  return (
    <div className="space-y-3">
      {/* Look Back panel */}
      <button
        type="button"
        onClick={() => setShowLookback((prev) => !prev)}
        className="w-full flex items-center gap-2 px-3 py-2 rounded-xl bg-white/5 border border-violet-500/20 text-sm text-violet-300 hover:bg-white/10 transition-colors"
      >
        <History className="w-4 h-4 text-violet-400" />
        <span className="font-medium">Look Back</span>
        <span className="text-violet-500 text-xs ml-auto">What was I worried about?</span>
        {showLookback ? (
          <ChevronUp className="w-4 h-4 text-violet-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-violet-400 shrink-0" />
        )}
      </button>

      {showLookback && (
        <div className="rounded-xl bg-white/5 border border-violet-500/20 overflow-hidden">
          {/* Period tabs */}
          <div className="flex border-b border-violet-500/10">
            {PERIODS.map((period) => (
              <button
                key={period.key}
                onClick={() => setActivePeriod(period.key)}
                className={cn(
                  'flex-1 px-3 py-2 text-xs font-medium transition-colors',
                  activePeriod === period.key
                    ? 'text-violet-200 bg-violet-500/20 border-b-2 border-violet-400'
                    : 'text-violet-400 hover:text-violet-300 hover:bg-white/5'
                )}
              >
                {period.label}
              </button>
            ))}
          </div>

          <div className="p-3 max-h-64 overflow-y-auto">
            {lookbackLoading ? (
              <div className="flex items-center justify-center py-4">
                <div className="w-5 h-5 border-2 border-violet-400 border-t-transparent rounded-full animate-spin" />
              </div>
            ) : activeDays.length > 0 ? (
              <div className="space-y-3">
                {activeDays.map((day) => (
                  <div key={day.dateKey} className="space-y-1.5">
                    <p className="text-xs text-violet-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {day.dateKey}
                    </p>
                    {day.worries.map((w, i) => (
                      <div
                        key={w.id || i}
                        className="rounded-lg bg-white/5 px-3 py-2 space-y-1.5"
                      >
                        <p className="text-sm text-violet-200">{w.worry || 'No worry text'}</p>
                        {w.worstCase && (
                          <p className="text-xs text-orange-400/80">
                            <span className="font-medium">Worst case:</span> {w.worstCase}
                          </p>
                        )}
                        {w.action && (
                          <p className="text-xs text-emerald-400/80">
                            <span className="font-medium">Action:</span> {w.action}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-violet-400/50 text-center py-3">
                No worries recorded in this period
              </p>
            )}
          </div>
        </div>
      )}

      {/* Current worries */}
      {entries.map((entry) => {
        const isExpanded = expandedId === entry.id;
        const preview = entry.worry || 'New worry...';

        return (
          <div
            key={entry.id}
            className="rounded-xl bg-white/5 border border-violet-500/20 overflow-hidden"
          >
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

            {isExpanded && (
              <div className="px-3 pb-3 space-y-3 border-t border-violet-500/10">
                <div className="pt-3">
                  <label className="text-xs font-medium text-violet-400 mb-1 block">
                    What&apos;s worrying me...
                  </label>
                  <textarea
                    value={entry.worry}
                    onChange={(e) => updateEntry(entry.id, 'worry', e.target.value)}
                    placeholder="Describe what's on your mind"
                    disabled={readOnly}
                    rows={2}
                    className="w-full p-2.5 rounded-lg bg-white/5 border border-violet-500/20 text-violet-100 text-sm placeholder:text-violet-400/40 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-orange-400 mb-1 block">
                    What&apos;s the worst that could happen?
                  </label>
                  <textarea
                    value={entry.worstCase}
                    onChange={(e) => updateEntry(entry.id, 'worstCase', e.target.value)}
                    placeholder="Be honest — then ask: how likely is this really?"
                    disabled={readOnly}
                    rows={2}
                    className="w-full p-2.5 rounded-lg bg-white/5 border border-orange-500/20 text-violet-100 text-sm placeholder:text-violet-400/40 resize-none focus:outline-none focus:ring-2 focus:ring-orange-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
                  />
                </div>

                <div>
                  <label className="text-xs font-medium text-emerald-400 mb-1 block">
                    What can I do about it?
                  </label>
                  <textarea
                    value={entry.action}
                    onChange={(e) => updateEntry(entry.id, 'action', e.target.value)}
                    placeholder="One small step, or: nothing — and that's okay too"
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
          Add a worry
        </button>
      )}

      {entries.length === 0 && readOnly && (
        <p className="text-sm text-violet-400/50 text-center py-3">
          No worries recorded
        </p>
      )}
    </div>
  );
}
