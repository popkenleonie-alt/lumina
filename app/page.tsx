'use client';

import { useState, useCallback, useEffect } from 'react';
import { migrateLocalStorageToDB } from '@/lib/migrateLocalStorage';
import { WeekStrip } from '@/components/journal/WeekStrip';
import { DayView } from '@/components/journal/DayView';
import { FloatingButton } from '@/components/journal/FloatingButton';
import { FinishDayDrawer } from '@/components/journal/FinishDayDrawer';
import { formatDateKey, getNextDay, getPreviousDay, isTodayCheck } from '@/lib/dateHelpers';

export default function LuminaJournal() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);
  const [showFinishDay, setShowFinishDay] = useState(false);
  const [dayViewRevision, setDayViewRevision] = useState(0);

  const minSwipeDistance = 50;

  // One-time migration from localStorage to database
  useEffect(() => {
    migrateLocalStorageToDB();
  }, []);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  }, []);

  const onTouchMove = useCallback((e: React.TouchEvent) => {
    setTouchEnd(e.targetTouches[0].clientX);
  }, []);

  const onTouchEnd = useCallback(() => {
    if (!touchStart || !touchEnd) return;

    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe) {
      setSlideDirection('left');
      setTimeout(() => {
        setSelectedDate(prev => getNextDay(prev));
        setSlideDirection(null);
      }, 150);
    } else if (isRightSwipe) {
      setSlideDirection('right');
      setTimeout(() => {
        setSelectedDate(prev => getPreviousDay(prev));
        setSlideDirection(null);
      }, 150);
    }
  }, [touchStart, touchEnd]);

  const handleFinishDay = useCallback(async (summary: string, stickers: string[]) => {
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
        <main
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          className={`transition-all duration-200 ease-out ${
            slideDirection === 'left'
              ? '-translate-x-4 opacity-0'
              : slideDirection === 'right'
              ? 'translate-x-4 opacity-0'
              : 'translate-x-0 opacity-100'
          }`}
        >
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
