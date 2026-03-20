'use client';

import { useState, useEffect, useCallback } from 'react';
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
  customSections: Record<string, CustomSectionData>;
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
  cycleTracker: { phase: null, mood: null },
  foodJournal: {
    morning: { text: '', photos: [] },
    noon: { text: '', photos: [] },
    evening: { text: '', photos: [] },
    snacks: { text: '', photos: [] },
  },
  beliefs: [],
  foodEntries: [],
  customSections: {},
  stickers: [],
  daySummary: '',
};

export function useJournalStore(selectedDate: Date) {
  const [data, setData] = useState<DayData>(defaultDayData);
  const [customSectionDefinitions, setCustomSectionDefinitions] = useState<CustomSectionDefinition[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  const dateKey = formatDateKey(selectedDate);

  // Load data from localStorage
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // Load day data
    const savedData = localStorage.getItem(`lumina-journal-${dateKey}`);
    if (savedData) {
      try {
        setData(JSON.parse(savedData));
      } catch {
        setData(defaultDayData);
      }
    } else {
      setData(defaultDayData);
    }
    
    // Load custom section definitions
    const savedDefinitions = localStorage.getItem('lumina-journal-custom-sections');
    if (savedDefinitions) {
      try {
        setCustomSectionDefinitions(JSON.parse(savedDefinitions));
      } catch {
        setCustomSectionDefinitions([]);
      }
    }
    
    setIsLoaded(true);
  }, [dateKey]);

  // Save data to localStorage
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    localStorage.setItem(`lumina-journal-${dateKey}`, JSON.stringify(data));
  }, [data, dateKey, isLoaded]);

  // Save custom section definitions
  useEffect(() => {
    if (!isLoaded || typeof window === 'undefined') return;
    localStorage.setItem('lumina-journal-custom-sections', JSON.stringify(customSectionDefinitions));
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

  const updateCustomSectionData = useCallback((sectionId: string, sectionData: CustomSectionData) => {
    setData(prev => ({
      ...prev,
      customSections: {
        ...prev.customSections,
        [sectionId]: sectionData,
      },
    }));
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
    addCustomSection,
    updateCustomSection,
    deleteCustomSection,
    reorderCustomSections,
    updateCustomSectionData,
    updateStickers,
    updateDaySummary,
  };
}
