'use client';

import { useState, useCallback, useEffect } from 'react';

const STORAGE_KEY = 'lumina-hidden-sections';

export function useHiddenSections() {
  const [hiddenSections, setHiddenSections] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        setHiddenSections(new Set(JSON.parse(stored)));
      }
    } catch {
      // ignore
    }
    setIsLoaded(true);
  }, []);

  const toggleSection = useCallback((sectionId: string) => {
    setHiddenSections(prev => {
      const next = new Set(prev);
      if (next.has(sectionId)) {
        next.delete(sectionId);
      } else {
        next.add(sectionId);
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify([...next]));
      return next;
    });
  }, []);

  return { hiddenSections, toggleSection, isLoaded };
}
