'use client';

import { cn } from '@/lib/utils';
import type { CycleData } from '@/hooks/useJournalStore';

interface CycleTrackerProps {
  data: CycleData;
  onChange: (data: Partial<CycleData>) => void;
  readOnly?: boolean;
}

const phases = [
  { value: 'menstrual', label: 'Menstrual', color: 'bg-red-100 text-red-600 border-red-200' },
  { value: 'follicular', label: 'Follicular', color: 'bg-pink-100 text-pink-600 border-pink-200' },
  { value: 'ovulation', label: 'Ovulation', color: 'bg-rose-100 text-rose-600 border-rose-200' },
  { value: 'luteal', label: 'Luteal', color: 'bg-amber-100 text-amber-600 border-amber-200' },
];

const moods = ['😊', '😐', '😢', '😤', '🥱', '🤩', '😌', '🥺'];

export function CycleTracker({ data, onChange, readOnly }: CycleTrackerProps) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-violet-300 mb-2 block">Cycle Phase</label>
        <div className="flex flex-wrap gap-2">
          {phases.map((phase) => (
            <button
              key={phase.value}
              onClick={() => !readOnly && onChange({ phase: data.phase === phase.value ? null : phase.value })}
              disabled={readOnly}
              className={cn(
                'px-3 py-1.5 rounded-full text-xs font-medium border transition-all',
                data.phase === phase.value
                  ? phase.color
                  : 'bg-white/5 text-violet-300 border-violet-500/20 hover:bg-white/10',
                readOnly && 'cursor-not-allowed'
              )}
            >
              {phase.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label className="text-xs font-medium text-violet-300 mb-2 block">Mood</label>
        <div className="flex gap-2">
          {moods.map((mood) => (
            <button
              key={mood}
              onClick={() => !readOnly && onChange({ mood: data.mood === mood ? null : mood })}
              disabled={readOnly}
              className={cn(
                'w-9 h-9 rounded-xl flex items-center justify-center text-lg transition-all',
                data.mood === mood
                  ? 'bg-gradient-to-br from-violet-600/30 to-purple-600/30 scale-110 shadow-md ring-1 ring-violet-500/30'
                  : 'bg-white/5 hover:bg-white/10',
                readOnly && 'cursor-not-allowed'
              )}
            >
              {mood}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
