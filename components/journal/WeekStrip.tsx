'use client';

import { getWeekDays, getDayName, getDayNumber, isSameDayCheck, isTodayCheck } from '@/lib/dateHelpers';
import { BookOpen } from 'lucide-react';
import { cn } from '@/lib/utils';

interface WeekStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  weekWrapSelected?: boolean;
  onSelectWeekWrap?: () => void;
}

export function WeekStrip({ selectedDate, onSelectDate, weekWrapSelected, onSelectWeekWrap }: WeekStripProps) {
  const weekDays = getWeekDays(selectedDate);
  const sunday = weekDays[6]; // Mon-start week, Sunday is last
  const now = new Date();
  const sundayEnd = new Date(sunday);
  sundayEnd.setHours(23, 59, 59, 999);
  const weekWrapAvailable = true; // TODO: restrict to Sunday (now >= sunday)

  return (
    <div className="flex justify-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
      {weekDays.map((day) => {
        const isSelected = !weekWrapSelected && isSameDayCheck(day, selectedDate);
        const isToday = isTodayCheck(day);

        return (
          <button
            key={day.toISOString()}
            onClick={() => onSelectDate(day)}
            className={cn(
              'flex flex-col items-center justify-center min-w-[44px] py-2 px-3 rounded-xl transition-all duration-300',
              isSelected
                ? 'bg-gradient-to-br from-violet-600 to-purple-600 text-white shadow-lg shadow-violet-500/30'
                : isToday
                ? 'bg-violet-500/20 text-violet-300 ring-2 ring-violet-500/50'
                : 'bg-white/5 text-violet-200/70 hover:bg-white/10'
            )}
          >
            <span className="text-xs font-medium opacity-80">{getDayName(day)}</span>
            <span className={cn('text-lg font-semibold', isSelected && 'text-white')}>
              {getDayNumber(day)}
            </span>
          </button>
        );
      })}

      {/* Week Wrap — available from Sunday */}
      <button
        onClick={onSelectWeekWrap}
        disabled={!weekWrapAvailable}
        className={cn(
          'flex flex-col items-center justify-center min-w-[44px] py-2 px-3 rounded-xl transition-all duration-300',
          weekWrapSelected
            ? 'bg-gradient-to-br from-fuchsia-600 to-purple-600 text-white shadow-lg shadow-fuchsia-500/30'
            : weekWrapAvailable
              ? 'bg-white/5 text-fuchsia-300/70 hover:bg-white/10'
              : 'bg-white/[0.02] text-violet-400/20 cursor-not-allowed',
        )}
      >
        <BookOpen className={cn('w-3.5 h-3.5', weekWrapSelected ? 'text-white' : 'opacity-80')} />
        <span className={cn('text-[9px] font-semibold mt-0.5', weekWrapSelected && 'text-white')}>
          Wrap
        </span>
      </button>
    </div>
  );
}
