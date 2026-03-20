'use client';

import { useState, useEffect } from 'react';
import { Sunset } from 'lucide-react';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import { formatDateKey } from '@/lib/dateHelpers';
import type { DayData, CustomSectionDefinition } from '@/hooks/useJournalStore';

interface FinishDayDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedDate: Date;
  onFinish: (summary: string, stickers: string[]) => void;
}

export function FinishDayDrawer({
  open,
  onOpenChange,
  selectedDate,
  onFinish,
}: FinishDayDrawerProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSummary(null);
      setError(null);
      return;
    }

    const dateKey = formatDateKey(selectedDate);

    let dayData: DayData;
    try {
      const saved = localStorage.getItem(`lumina-journal-${dateKey}`);
      dayData = saved ? JSON.parse(saved) : null;
    } catch {
      dayData = null as unknown as DayData;
    }

    let customSectionDefinitions: CustomSectionDefinition[] = [];
    try {
      const saved = localStorage.getItem('lumina-journal-custom-sections');
      if (saved) customSectionDefinitions = JSON.parse(saved);
    } catch {
      // ignore
    }

    if (!dayData) {
      setSummary(
        "It looks like your journal is empty today. That's okay — sometimes the best thing you can do is simply show up. Tomorrow is a fresh page.",
      );
      return;
    }

    setLoading(true);
    fetch('/api/finish-day', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dayData, customSectionDefinitions, dateKey }),
    })
      .then(async (res) => {
        if (!res.ok) throw new Error('Failed to generate summary');
        const json = await res.json();
        setSummary(json.summary);
        onFinish(json.summary, json.stickers ?? []);
      })
      .catch(() => {
        setError('Could not generate your day summary. Please try again.');
      })
      .finally(() => {
        setLoading(false);
      });
  }, [open, selectedDate, onFinish]);

  return (
    <Drawer open={open} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-gray-950 border-violet-500/30">
        <DrawerHeader className="text-center">
          <div className="flex items-center justify-center gap-2">
            <Sunset className="w-5 h-5 text-amber-400" />
            <DrawerTitle className="text-lg font-serif text-violet-200">
              Day Summary
            </DrawerTitle>
          </div>
          <DrawerDescription className="text-violet-400/60 text-xs">
            Your day at a glance
          </DrawerDescription>
        </DrawerHeader>

        <div className="px-6 pb-6">
          {loading && (
            <div className="flex items-center justify-center py-8">
              <div className="flex gap-1.5">
                {[0, 1, 2].map((i) => (
                  <div
                    key={i}
                    className="w-2 h-2 rounded-full bg-violet-400 animate-bounce"
                    style={{ animationDelay: `${i * 0.15}s` }}
                  />
                ))}
              </div>
            </div>
          )}

          {error && (
            <div className="rounded-xl bg-red-950/30 border border-red-500/20 p-4 text-red-300 text-sm text-center">
              {error}
            </div>
          )}

          {summary && !loading && (
            <div className="rounded-xl bg-violet-950/30 border border-violet-500/20 p-4">
              <p className="text-violet-100 text-sm leading-relaxed whitespace-pre-wrap">
                {summary}
              </p>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
