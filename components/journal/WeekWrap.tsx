'use client';

import { useState, useEffect } from 'react';
import { Moon, CheckCircle, Dumbbell, Heart, UtensilsCrossed, Brain, CloudRain, Award, Sun, MessageSquare } from 'lucide-react';
import { getWeekDays, formatDateKey } from '@/lib/dateHelpers';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DayData } from '@/hooks/useJournalStore';
import type { SportType } from '@/hooks/useSportTypes';

interface WeekWrapProps {
  selectedDate: Date;
  sportTypes: SportType[];
}

const COLOR_MAP: Record<string, { dot: string; bg: string; text: string }> = {
  amber:  { dot: 'bg-amber-500/20',  bg: 'bg-amber-500/20',  text: 'text-amber-400' },
  purple: { dot: 'bg-purple-500/20', bg: 'bg-purple-500/20', text: 'text-purple-400' },
  green:  { dot: 'bg-emerald-500/20', bg: 'bg-emerald-500/20', text: 'text-emerald-400' },
  violet: { dot: 'bg-violet-500/20', bg: 'bg-violet-500/20', text: 'text-violet-400' },
  rose:   { dot: 'bg-rose-500/20',   bg: 'bg-rose-500/20',   text: 'text-rose-400' },
  teal:   { dot: 'bg-teal-500/20',   bg: 'bg-teal-500/20',   text: 'text-teal-400' },
  orange: { dot: 'bg-orange-500/20', bg: 'bg-orange-500/20', text: 'text-orange-400' },
};

interface SectionHighlight {
  id: string;
  title: string;
  icon: React.ReactNode;
  color: string;
  stats: { label: string; value: string | number }[];
  empty?: boolean;
}

export function WeekWrap({ selectedDate, sportTypes }: WeekWrapProps) {
  const [weekData, setWeekData] = useState<Record<string, DayData | null>>({});
  const [loading, setLoading] = useState(true);
  const [summaries, setSummaries] = useState<Record<string, string>>({});
  const [summariesLoading, setSummariesLoading] = useState(false);
  const weekDays = getWeekDays(selectedDate);
  const weekKey = formatDateKey(weekDays[0]);
  const dateKeys = weekDays.map(d => formatDateKey(d));

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setSummaries({});
    Promise.all(
      dateKeys.map(dk =>
        fetch(`/api/journal?dateKey=${dk}`)
          .then(r => r.json())
          .then(data => ({ dk, data: data as DayData | null }))
          .catch(() => ({ dk, data: null }))
      )
    ).then(results => {
      if (cancelled) return;
      const map: Record<string, DayData | null> = {};
      for (const { dk, data } of results) map[dk] = data;
      setWeekData(map);
      setLoading(false);

      // Fetch AI summaries in background
      const hasData = Object.values(map).some(Boolean);
      if (hasData) {
        setSummariesLoading(true);
        fetch('/api/week-wrap', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ dateKeys }),
        })
          .then(r => r.json())
          .then(data => {
            if (!cancelled && !data.error) setSummaries(data);
          })
          .catch(() => {})
          .finally(() => { if (!cancelled) setSummariesLoading(false); });
      }
    });
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [weekKey]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-fuchsia-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const days = Object.values(weekData).filter(Boolean) as DayData[];
  const dateRange = `${format(weekDays[0], 'MMM d')} – ${format(weekDays[6], 'MMM d')}`;

  // Build label map — sportTypes may load async from localStorage, so re-derive each render
  const sportLabelMap: Record<string, string> = {};
  for (const s of sportTypes) sportLabelMap[s.id] = s.label;

  const sections: SectionHighlight[] = [
    buildIntentions(days),
    buildDreams(days),
    buildDoneList(days),
    buildSports(days, sportLabelMap),
    buildCycle(days),
    buildFood(days),
    buildBeliefs(days),
    buildWorries(days),
    buildReflections(days),
  ];

  return (
    <div className="px-6 pb-24 pt-4">
      {/* Header */}
      <div className="text-center mb-8">
        <h2 className="font-serif text-xl font-bold text-fuchsia-200">Week Wrap</h2>
        <p className="text-sm text-violet-300/50 mt-1">{dateRange}</p>
      </div>

      {/* Vertical timeline */}
      <div className="relative">
        {sections.map((section, i) => {
          const colors = COLOR_MAP[section.color] ?? COLOR_MAP.violet;
          return (
            <div key={section.id} className="relative flex gap-4">
              {/* Timeline line + dot */}
              <div className="flex flex-col items-center">
                <div className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center shrink-0 z-10',
                  section.empty ? 'bg-white/5' : colors.dot,
                )}>
                  <div className={cn(section.empty ? 'text-violet-400/30' : colors.text)}>
                    {section.icon}
                  </div>
                </div>
                {i < sections.length - 1 && (
                  <div className="w-px flex-1 min-h-[16px] bg-gradient-to-b from-violet-500/30 to-violet-500/10" />
                )}
              </div>

              {/* Content card */}
              <div className={cn(
                'flex-1 mb-4 rounded-xl p-4 transition-all',
                section.empty ? 'bg-white/[0.02]' : 'bg-white/[0.04]',
              )}>
                <h3 className={cn(
                  'text-sm font-semibold mb-2',
                  section.empty ? 'text-violet-300/30' : 'text-violet-200',
                )}>
                  {section.title}
                </h3>

                {section.empty ? (
                  <p className="text-xs text-violet-400/30">Nothing this week</p>
                ) : (
                  <>
                    <div className="flex flex-wrap gap-x-5 gap-y-1.5">
                      {section.stats.map(stat => (
                        <div key={stat.label} className="flex items-baseline gap-1.5">
                          <span className={cn('text-lg font-bold', colors.text)}>
                            {stat.value}
                          </span>
                          <span className="text-xs text-violet-300/50">{stat.label}</span>
                        </div>
                      ))}
                    </div>
                    {/* AI summary */}
                    {summaries[section.id] && summaries[section.id] !== '—' ? (
                      <p className="text-xs text-violet-200/60 mt-2 leading-relaxed italic">
                        {summaries[section.id]}
                      </p>
                    ) : summariesLoading ? (
                      <div className="mt-2 h-3 w-3/4 rounded bg-white/5 animate-pulse" />
                    ) : null}
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

/* ─── Section builders ─── */

function buildIntentions(days: DayData[]): SectionHighlight {
  const intentions = days.map(d => d.intention).filter(Boolean);
  return {
    id: 'intentions',
    title: 'Intentions',
    icon: <Sun className="w-4 h-4" />,
    color: 'amber',
    empty: intentions.length === 0,
    stats: intentions.length > 0
      ? [{ label: 'days with intention', value: intentions.length }]
      : [],
  };
}

function buildDreams(days: DayData[]): SectionHighlight {
  const dreamsLogged = days.filter(d => d.dreamJournal?.trim()).length;
  const totalWords = days.reduce((sum, d) => sum + (d.dreamJournal?.trim().split(/\s+/).length ?? 0), 0);
  return {
    id: 'dreams',
    title: 'Dream Journal',
    icon: <Moon className="w-4 h-4" />,
    color: 'purple',
    empty: dreamsLogged === 0,
    stats: dreamsLogged > 0
      ? [
          { label: 'nights recorded', value: dreamsLogged },
          { label: 'words written', value: totalWords },
        ]
      : [],
  };
}

function buildDoneList(days: DayData[]): SectionHighlight {
  const allItems = days.flatMap(d => d.doneList ?? []);
  const checked = allItems.filter(i => i.checked).length;
  return {
    id: 'done-list',
    title: 'Done List',
    icon: <CheckCircle className="w-4 h-4" />,
    color: 'green',
    empty: allItems.length === 0,
    stats: allItems.length > 0
      ? [
          { label: 'tasks completed', value: checked },
          { label: 'total tasks', value: allItems.length },
        ]
      : [],
  };
}

function buildSports(days: DayData[], sportLabels: Record<string, string>): SectionHighlight {
  const allSports = days.flatMap(d => d.sports ?? []);
  const totalSessions = allSports.length;
  const activeDays = days.filter(d => (d.sports ?? []).length > 0).length;

  // Most practiced sport
  const freq: Record<string, number> = {};
  for (const s of allSports) freq[s] = (freq[s] ?? 0) + 1;
  const topSport = Object.entries(freq).sort((a, b) => b[1] - a[1])[0];

  const stats: { label: string; value: string | number }[] = [];
  if (totalSessions > 0) {
    stats.push({ label: 'sessions', value: totalSessions });
    stats.push({ label: 'active days', value: activeDays });
    if (topSport) {
      const label = sportLabels[topSport[0]];
      if (label) {
        stats.push({ label: 'top sport', value: label });
      }
    }
  }

  return {
    id: 'sports',
    title: 'Sports',
    icon: <Dumbbell className="w-4 h-4" />,
    color: 'violet',
    empty: totalSessions === 0,
    stats,
  };
}

function buildCycle(days: DayData[]): SectionHighlight {
  const moods = days.map(d => d.cycleTracker?.mood).filter(Boolean) as string[];
  const phases = days.map(d => d.cycleTracker?.phase).filter(Boolean) as string[];

  // Most common mood
  const moodFreq: Record<string, number> = {};
  for (const m of moods) moodFreq[m] = (moodFreq[m] ?? 0) + 1;
  const topMood = Object.entries(moodFreq).sort((a, b) => b[1] - a[1])[0];

  return {
    id: 'cycle',
    title: 'Cycle Tracker',
    icon: <Heart className="w-4 h-4" />,
    color: 'rose',
    empty: moods.length === 0 && phases.length === 0,
    stats: [
      ...(moods.length > 0 ? [{ label: 'moods logged', value: moods.length }] : []),
      ...(topMood ? [{ label: 'most common mood', value: topMood[0] }] : []),
      ...(phases.length > 0 ? [{ label: 'days tracked', value: phases.length }] : []),
    ],
  };
}

function buildFood(days: DayData[]): SectionHighlight {
  const entries = days.flatMap(d => d.foodEntries ?? []);
  const daysLogged = days.filter(d => (d.foodEntries ?? []).length > 0).length;

  // Most frequent foods (by "what" field, first word)
  const foodFreq: Record<string, number> = {};
  for (const e of entries) {
    const key = e.what?.trim().toLowerCase();
    if (key) foodFreq[key] = (foodFreq[key] ?? 0) + 1;
  }
  const topFoods = Object.entries(foodFreq).sort((a, b) => b[1] - a[1]).slice(0, 2);

  return {
    id: 'food',
    title: 'Food Journal',
    icon: <UtensilsCrossed className="w-4 h-4" />,
    color: 'amber',
    empty: entries.length === 0,
    stats: [
      ...(entries.length > 0 ? [{ label: 'meals logged', value: entries.length }] : []),
      ...(daysLogged > 0 ? [{ label: 'days tracked', value: daysLogged }] : []),
      ...(topFoods.length > 0 ? [{ label: 'most eaten', value: topFoods[0][0] }] : []),
    ],
  };
}

function buildBeliefs(days: DayData[]): SectionHighlight {
  const entries = days.flatMap(d => d.beliefs ?? []);
  const withReframe = entries.filter(e => e.reframe?.trim()).length;
  return {
    id: 'beliefs',
    title: 'Beliefs',
    icon: <Brain className="w-4 h-4" />,
    color: 'teal',
    empty: entries.length === 0,
    stats: entries.length > 0
      ? [
          { label: 'beliefs examined', value: entries.length },
          { label: 'reframed', value: withReframe },
        ]
      : [],
  };
}

function buildWorries(days: DayData[]): SectionHighlight {
  const entries = days.flatMap(d => d.worries ?? []);
  const withAction = entries.filter(e => e.action?.trim()).length;
  return {
    id: 'worries',
    title: 'Worries',
    icon: <CloudRain className="w-4 h-4" />,
    color: 'orange',
    empty: entries.length === 0,
    stats: entries.length > 0
      ? [
          { label: 'worries processed', value: entries.length },
          { label: 'with action plan', value: withAction },
        ]
      : [],
  };
}

function buildReflections(days: DayData[]): SectionHighlight {
  const withSummary = days.filter(d => d.daySummary?.trim()).length;
  const totalStickers = days.reduce((sum, d) => sum + (d.stickers ?? []).length, 0);
  return {
    id: 'reflections',
    title: 'Day Reflections',
    icon: <Award className="w-4 h-4" />,
    color: 'amber',
    empty: withSummary === 0 && totalStickers === 0,
    stats: [
      ...(withSummary > 0 ? [{ label: 'days reflected', value: withSummary }] : []),
      ...(totalStickers > 0 ? [{ label: 'stickers earned', value: totalStickers }] : []),
    ],
  };
}
