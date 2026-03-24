'use client';

import { useState, useCallback, useEffect } from 'react';

export interface SportType {
  id: string;
  label: string;
}

const STORAGE_KEY = 'lumina-sport-types';

const DEFAULT_SPORT_TYPES: SportType[] = [
  { id: 'yoga', label: 'Yoga' },
  { id: 'legs', label: 'Leg Day' },
  { id: 'upper-body', label: 'Upper Body' },
  { id: 'spinning', label: 'Spinning' },
  { id: 'pilates', label: 'Pilates' },
];

export function useSportTypes() {
  const [sportTypes, setSportTypes] = useState<SportType[]>(DEFAULT_SPORT_TYPES);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setSportTypes(parsed);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  const persist = (types: SportType[]) => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(types));
  };

  const addSportType = useCallback((label: string) => {
    setSportTypes(prev => {
      const next = [...prev, { id: `sport-${Date.now()}`, label }];
      persist(next);
      return next;
    });
  }, []);

  const updateSportType = useCallback((id: string, label: string) => {
    setSportTypes(prev => {
      const next = prev.map(s => (s.id === id ? { ...s, label } : s));
      persist(next);
      return next;
    });
  }, []);

  const deleteSportType = useCallback((id: string) => {
    setSportTypes(prev => {
      const next = prev.filter(s => s.id !== id);
      persist(next);
      return next;
    });
  }, []);

  return { sportTypes, addSportType, updateSportType, deleteSportType };
}
