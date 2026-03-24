'use client';

import { useState, useEffect, useCallback } from 'react';
import { formatDateKey } from '@/lib/dateHelpers';
import { subDays } from 'date-fns';

function getLast7Days(date: Date): Date[] {
  return Array.from({ length: 7 }, (_, i) => subDays(date, 6 - i));
}

export function useWeekSports(selectedDate: Date) {
  const [weekSports, setWeekSports] = useState<Record<string, string[]>>({});
  const weekDays = getLast7Days(selectedDate);
  const weekKey = formatDateKey(selectedDate);

  useEffect(() => {
    let cancelled = false;
    const dateKeys = weekDays.map(d => formatDateKey(d));
    Promise.all(
      dateKeys.map(dk =>
        fetch(`/api/journal?dateKey=${dk}`)
          .then(r => r.json())
          .then(data => ({ dk, sports: (data?.sports ?? []) as string[] }))
          .catch(() => ({ dk, sports: [] as string[] }))
      )
    ).then(results => {
      if (cancelled) return;
      const map: Record<string, string[]> = {};
      for (const { dk, sports } of results) map[dk] = sports;
      setWeekSports(map);
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekKey]);

  const toggleSport = useCallback((dateKey: string, sport: string) => {
    setWeekSports(prev => {
      const current = prev[dateKey] ?? [];
      const next = current.includes(sport) ? current.filter(s => s !== sport) : [...current, sport];
      fetch(`/api/journal?dateKey=${dateKey}`)
        .then(r => r.json())
        .then(data => {
          const updated = { ...(data ?? {}), sports: next };
          fetch('/api/journal', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ dateKey, data: updated }),
          });
        })
        .catch(() => {});
      return { ...prev, [dateKey]: next };
    });
  }, []);

  return { weekSports, weekDays, toggleSport };
}
