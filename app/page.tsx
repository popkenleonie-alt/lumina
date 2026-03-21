'use client';

import { useState, useCallback, useEffect } from 'react';
import { migrateLocalStorageToDB } from '@/lib/migrateLocalStorage';
import { WeekStrip } from '@/components/journal/WeekStrip';
import { DayView } from '@/components/journal/DayView';
import { FloatingButton } from '@/components/journal/FloatingButton';
import { FinishDayDrawer } from '@/components/journal/FinishDayDrawer';
import { formatDateKey, isTodayCheck } from '@/lib/dateHelpers';

export default function LuminaJournal() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showFinishDay, setShowFinishDay] = useState(false);
  const [dayViewRevision, setDayViewRevision] = useState(0);

  // Initialize date and run migration on mount (client-only)
  useEffect(() => {
    setSelectedDate(new Date());
    migrateLocalStorageToDB();
  }, []);

  const handleFinishDay = useCallback(async (summary: string, stickers: string[]) => {
    if (!selectedDate) return;
    const dateKey = formatDateKey(selectedDate);
    try {
      const res = await fetch(`/api/journal?dateKey=${dateKey}`);
      const dayData = res.ok ? (await res.json()) ?? {} : {};
      dayData.stickers = stickers;
      dayData.daySummary = summary;
      await fetch('/api/journal', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ dateKey, data: dayData }),
      });
      setDayViewRevision(r => r + 1);
    } catch {
      // ignore
    }
  }, [selectedDate]);

  if (!selectedDate) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-black to-purple-950" />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-black to-purple-950">
      <div className="mx-auto max-w-[430px] md:max-w-none min-h-screen">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-black/80 backdrop-blur-md border-b border-violet-500/20">
          <div className="px-4 pt-4 pb-2">
            <h1 className="font-serif text-2xl font-bold text-center bg-gradient-to-r from-violet-400 via-purple-400 to-fuchsia-400 bg-clip-text text-transparent">
              Lumina Journal
            </h1>
          </div>
          <WeekStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </header>

        {/* Day Content */}
        <main>
          <DayView key={dayViewRevision} selectedDate={selectedDate} />
        </main>

        {/* Finish the Day */}
        <FloatingButton
          onClick={() => setShowFinishDay(true)}
          visible={isTodayCheck(selectedDate)}
        />
        <FinishDayDrawer
          open={showFinishDay}
          onOpenChange={setShowFinishDay}
          selectedDate={selectedDate}
          onFinish={handleFinishDay}
        />
      </div>
    </div>
  );
}
