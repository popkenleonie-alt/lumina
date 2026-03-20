'use client';

import { getWeekDays, getDayName, getDayNumber, isSameDayCheck, isTodayCheck } from '@/lib/dateHelpers';
import { cn } from '@/lib/utils';

interface WeekStripProps {
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
}

export function WeekStrip({ selectedDate, onSelectDate }: WeekStripProps) {
  const weekDays = getWeekDays(selectedDate);

  return (
    <div className="flex justify-center gap-2 px-4 py-3 overflow-x-auto scrollbar-hide">
      {weekDays.map((day) => {
        const isSelected = isSameDayCheck(day, selectedDate);
        const isToday = isTodayCheck(day);

        return (
          <button
            key={day.toISOString()}
            onClick={() => onSelectDate(day)}
            className={cn(
              'flex flex-col items-center justify-center min-w-[44px] py-2 px-3 rounded-xl transition-all duration-300',
              isSelected
                ? 'bg-gradient-to-br from-pink-400 via-rose-400 to-violet-400 text-white shadow-lg shadow-pink-300/50'
                : isToday
                ? 'bg-white/60 text-rose-500 ring-2 ring-rose-300'
                : 'bg-white/40 text-foreground/70 hover:bg-white/60'
            )}
          >
            <span className="text-xs font-medium opacity-80">{getDayName(day)}</span>
            <span className={cn('text-lg font-semibold', isSelected && 'text-white')}>
              {getDayNumber(day)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
