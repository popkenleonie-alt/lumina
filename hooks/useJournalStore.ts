'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { formatDateKey } from '@/lib/dateHelpers';

export interface ChecklistItem {
  id: string;
  text: string;
  checked: boolean;
  timestamp?: string;
}

export interface MealEntry {
  text: string;
  photos: string[];
}

export interface FoodEntry {
  id: string;
  timestamp: string;
  what: string;
  why: string;
  feelingBefore: string;
  feelingAfter: string;
  photos: string[];
}

export interface CycleData {
  phase: string | null;
  mood: string | null;
}

export interface CustomSectionData {
  text?: string;
  checklist?: ChecklistItem[];
  photos?: string[];
  rating?: number;
}

export interface BeliefEntry {
  id: string;
  belief: string;
  challenge: string;
  reframe: string;
}

export interface WorryEntry {
  id: string;
  worry: string;
  worstCase: string;
  action: string;
}

export interface DayData {
  dreamJournal: string;
  doneList: ChecklistItem[];
  badges: string[];
  cycleTracker: CycleData;
  foodJournal: {
    morning: MealEntry;
    noon: MealEntry;
    evening: MealEntry;
    snacks: MealEntry;
  };
  foodEntries: FoodEntry[];
  beliefs: BeliefEntry[];
  worries: WorryEntry[];
  intention: string;
  customSections: Record<string, CustomSectionData>;
  notes: string;
  notePhotos: string[];
  stickers: string[];
  daySummary: string;
}

export interface CustomSectionDefinition {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: 'text' | 'checklist' | 'photo' | 'rating';
  order: number;
}

const defaultDayData: DayData = {
  dreamJournal: '',
  doneList: [],
  badges: [],
  intention: '',
  cycleTracker: { phase: null, mood: null },
  foodJournal: {
    morning: { text: '', photos: [] },
    noon: { text: '', photos: [] },
    evening: { text: '', photos: [] },
    snacks: { text: '', photos: [] },
  },
  beliefs: [],
  worries: [],
  foodEntries: [],
  customSections: {},
  notes: '',
  notePhotos: [],
  stickers: [],
  daySummary: '',
};

export function useJournalStore(selectedDate: Date) {
  const [data, setData] = useState<DayData>(defaultDayData);
  const [customSectionDefinitions, setCustomSectionDefinitions] = useState<CustomSectionDefinition[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  const dateKey = formatDateKey(selectedDate);

  // Refs for debounced saving
  const saveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const sectionsSaveTimerRef = useRef<ReturnType<typeof setTimeout>>();
  const dataRef = useRef(data);
  dataRef.current = data;
  const sectionsRef = useRef(customSectionDefinitions);
  sectionsRef.current = customSectionDefinitions;
  const dateKeyRef = useRef(dateKey);
  dateKeyRef.current = dateKey;

  // Load day data from API
  useEffect(() => {
    setIsLoaded(false);
    let cancelled = false;

    async function load() {
      try {
        const [dayRes, sectionsRes] = await Promise.all([
          fetch(`/api/journal?dateKey=${dateKey}`),
          fetch('/api/journal/custom-sections'),
        ]);

        if (cancelled) return;

        const dayData = await dayRes.json();
        setData(dayData ?? defaultDayData);

        const sections = await sectionsRes.json();
        setCustomSectionDefinitions(Array.isArray(sections) ? sections : []);
      } catch {
        if (!cancelled) {
          setData(defaultDayData);
          setCustomSectionDefinitions([]);
        }
      }
      if (!cancelled) setIsLoaded(true);
    }

    load();
    return () => { cancelled = true; };
  }, [dateKey]);

  // Debounced save for day data
  useEffect(() => {
    if (!isLoaded) return;

    // Capture the current dateKey and data in this closure to avoid
    // saving stale data to the wrong date after a date switch.
    const saveDateKey = dateKey;
    const saveData = data;

    clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      fetch('/api/journal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateKey: saveDateKey, data: saveData }),
      }).catch(() => {});
    }, 800);

    return () => clearTimeout(saveTimerRef.current);
  }, [data, dateKey, isLoaded]);

  // Debounced save for custom section definitions
  useEffect(() => {
    if (!isLoaded) return;

    clearTimeout(sectionsSaveTimerRef.current);
    sectionsSaveTimerRef.current = setTimeout(() => {
      fetch('/api/journal/custom-sections', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(sectionsRef.current),
      }).catch(() => {});
    }, 800);

    return () => clearTimeout(sectionsSaveTimerRef.current);
  }, [customSectionDefinitions, isLoaded]);

  const updateDreamJournal = useCallback((text: string) => {
    setData(prev => ({ ...prev, dreamJournal: text }));
  }, []);

  const updateDoneList = useCallback((items: ChecklistItem[]) => {
    setData(prev => ({ ...prev, doneList: items }));
  }, []);

  const toggleBadge = useCallback((badge: string) => {
    setData(prev => ({
      ...prev,
      badges: prev.badges.includes(badge)
        ? prev.badges.filter(b => b !== badge)
        : [...prev.badges, badge],
    }));
  }, []);

  const updateCycleTracker = useCallback((cycleData: Partial<CycleData>) => {
    setData(prev => ({
      ...prev,
      cycleTracker: { ...prev.cycleTracker, ...cycleData },
    }));
  }, []);

  const updateFoodJournal = useCallback((meal: keyof DayData['foodJournal'], entry: Partial<MealEntry>) => {
    setData(prev => ({
      ...prev,
      foodJournal: {
        ...prev.foodJournal,
        [meal]: { ...prev.foodJournal[meal], ...entry },
      },
    }));
  }, []);

  const addCustomSection = useCallback((section: Omit<CustomSectionDefinition, 'id' | 'order'>) => {
    const newSection: CustomSectionDefinition = {
      ...section,
      id: `custom-${Date.now()}`,
      order: customSectionDefinitions.length,
    };
    setCustomSectionDefinitions(prev => [...prev, newSection]);
  }, [customSectionDefinitions.length]);

  const updateCustomSection = useCallback((id: string, updates: Partial<CustomSectionDefinition>) => {
    setCustomSectionDefinitions(prev =>
      prev.map(s => (s.id === id ? { ...s, ...updates } : s))
    );
  }, []);

  const deleteCustomSection = useCallback((id: string) => {
    setCustomSectionDefinitions(prev => prev.filter(s => s.id !== id));
  }, []);

  const reorderCustomSections = useCallback((fromIndex: number, toIndex: number) => {
    setCustomSectionDefinitions(prev => {
      const updated = [...prev];
      const [removed] = updated.splice(fromIndex, 1);
      updated.splice(toIndex, 0, removed);
      return updated.map((s, i) => ({ ...s, order: i }));
    });
  }, []);

  const updateFoodEntries = useCallback((foodEntries: FoodEntry[]) => {
    setData(prev => ({ ...prev, foodEntries }));
  }, []);

  const updateBeliefs = useCallback((beliefs: BeliefEntry[]) => {
    setData(prev => ({ ...prev, beliefs }));
  }, []);

  const updateWorries = useCallback((worries: WorryEntry[]) => {
    setData(prev => ({ ...prev, worries }));
  }, []);

  const updateCustomSectionData = useCallback((sectionId: string, sectionData: CustomSectionData) => {
    setData(prev => ({
      ...prev,
      customSections: {
        ...prev.customSections,
        [sectionId]: sectionData,
      },
    }));
  }, []);

  const updateIntention = useCallback((intention: string) => {
    setData(prev => ({ ...prev, intention }));
  }, []);

  const updateNotes = useCallback((notes: string) => {
    setData(prev => ({ ...prev, notes }));
  }, []);

  const updateNotePhotos = useCallback((notePhotos: string[]) => {
    setData(prev => ({ ...prev, notePhotos }));
  }, []);

  const updateStickers = useCallback((stickers: string[]) => {
    setData(prev => ({ ...prev, stickers }));
  }, []);

  const updateDaySummary = useCallback((daySummary: string) => {
    setData(prev => ({ ...prev, daySummary }));
  }, []);

  return {
    data,
    customSectionDefinitions,
    isLoaded,
    updateDreamJournal,
    updateDoneList,
    toggleBadge,
    updateCycleTracker,
    updateFoodJournal,
    updateFoodEntries,
    updateBeliefs,
    updateWorries,
    addCustomSection,
    updateCustomSection,
    deleteCustomSection,
    reorderCustomSections,
    updateCustomSectionData,
    updateIntention,
    updateNotes,
    updateNotePhotos,
    updateStickers,
    updateDaySummary,
  };
}
