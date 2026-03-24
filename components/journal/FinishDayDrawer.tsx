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

interface Badge {
  name: string;
  category: string;
  intensity: number;
  explanation: string;
  whyItMatters: string;
}

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
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) {
      setSummary(null);
      setBadges([]);
      setError(null);
      return;
    }

    const dateKey = formatDateKey(selectedDate);

    setLoading(true);

    Promise.all([
      fetch(`/api/journal?dateKey=${dateKey}`).then(r => r.ok ? r.json() : null),
      fetch('/api/journal/custom-sections').then(r => r.ok ? r.json() : []),
    ])
      .then(([dayData, customSectionDefinitions]) => {
        if (!dayData) {
          setSummary(
            "It looks like your journal is empty today. That's okay — sometimes the best thing you can do is simply show up. Tomorrow is a fresh page.",
          );
          setLoading(false);
          return;
        }

        return fetch('/api/finish-day', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dayData, customSectionDefinitions: customSectionDefinitions ?? [], dateKey }),
        })
          .then(async (res) => {
            if (!res.ok) throw new Error('Failed to generate summary');
            const json = await res.json();
            setSummary(json.summary);
            setBadges(json.badges ?? []);
            onFinish(json.summary, json.stickers ?? []);
          });
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

        <div className="px-6 pb-6 overflow-y-auto max-h-[70vh]">
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
            <div className="space-y-4">
              <div className="rounded-xl bg-violet-950/30 border border-violet-500/20 p-4">
                <p className="text-violet-100 text-sm leading-relaxed whitespace-pre-wrap">
                  {summary}
                </p>
              </div>

              {badges.length > 0 && (
                <div className="space-y-3">
                  <h3 className="text-xs font-medium text-violet-400 uppercase tracking-wider">
                    Badges Earned
                  </h3>
                  {badges.map((badge, i) => {
                    const intensityDots = '●'.repeat(badge.intensity) + '○'.repeat(3 - badge.intensity);
                    const categoryColors: Record<string, string> = {
                      Discipline: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
                      Courage: 'text-red-400 bg-red-400/10 border-red-400/20',
                      Growth: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
                      Reflection: 'text-blue-400 bg-blue-400/10 border-blue-400/20',
                      Connection: 'text-pink-400 bg-pink-400/10 border-pink-400/20',
                      'Well-being': 'text-teal-400 bg-teal-400/10 border-teal-400/20',
                      Creativity: 'text-purple-400 bg-purple-400/10 border-purple-400/20',
                    };
                    const colorClass = categoryColors[badge.category] || 'text-violet-400 bg-violet-400/10 border-violet-400/20';

                    return (
                      <div key={i} className={`rounded-xl border p-3 ${colorClass.split(' ').slice(1).join(' ')}`}>
                        <div className="flex items-center justify-between mb-1">
                          <span className={`text-sm font-medium ${colorClass.split(' ')[0]}`}>
                            {badge.name}
                          </span>
                          <span className="text-[10px] text-violet-400/60">
                            {intensityDots}
                          </span>
                        </div>
                        <span className="inline-block text-[10px] px-1.5 py-0.5 rounded-full bg-white/5 text-violet-300/70 mb-1.5">
                          {badge.category}
                        </span>
                        <p className="text-xs text-violet-200/80 leading-relaxed">
                          {badge.explanation}
                        </p>
                        {badge.whyItMatters && (
                          <p className="text-xs text-violet-400/60 mt-1 italic">
                            {badge.whyItMatters}
                          </p>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  );
}
