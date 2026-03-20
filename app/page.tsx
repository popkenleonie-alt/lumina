'use client';

import { useState, useCallback } from 'react';
import { WeekStrip } from '@/components/journal/WeekStrip';
import { HeroArea } from '@/components/journal/HeroArea';
import { DayView } from '@/components/journal/DayView';
import { FloatingButton } from '@/components/journal/FloatingButton';
import { getNextDay, getPreviousDay } from '@/lib/dateHelpers';

export default function LuminaJournal() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [slideDirection, setSlideDirection] = useState<'left' | 'right' | null>(null);

  const minSwipeDistance = 50;

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

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-rose-200 via-pink-100 to-violet-200">
      <div className="mx-auto max-w-[430px] md:max-w-none min-h-screen bg-gradient-to-b from-white/30 to-white/50 shadow-2xl shadow-pink-300/20">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-md border-b border-white/50">
          <div className="px-4 pt-4 pb-2">
            <h1 className="font-serif text-2xl font-bold text-center bg-gradient-to-r from-rose-500 via-pink-500 to-violet-500 bg-clip-text text-transparent">
              Lumina Journal
            </h1>
          </div>
          <WeekStrip selectedDate={selectedDate} onSelectDate={setSelectedDate} />
        </header>

        {/* Hero Area */}
        <HeroArea />

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
          <DayView selectedDate={selectedDate} />
        </main>

        {/* Floating Action Button */}
        <FloatingButton onClick={scrollToTop} />
      </div>
    </div>
  );
}
