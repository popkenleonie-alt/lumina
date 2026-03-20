'use client';

import { useState } from 'react';
import { cn } from '@/lib/utils';

interface BadgesProps {
  selectedBadges: string[];
  onToggle: (badge: string) => void;
  readOnly?: boolean;
}

const availableBadges = ['💪', '🧘', '📚', '💧', '🌿', '✨', '🎯', '🛌', '🏃', '🍎', '🎨', '🎵'];

export function Badges({ selectedBadges, onToggle, readOnly }: BadgesProps) {
  const [animating, setAnimating] = useState<string | null>(null);

  const handleClick = (badge: string) => {
    if (readOnly) return;
    setAnimating(badge);
    onToggle(badge);
    setTimeout(() => setAnimating(null), 300);
  };

  return (
    <div className="grid grid-cols-6 gap-3">
      {availableBadges.map((badge) => {
        const isSelected = selectedBadges.includes(badge);
        const isAnimating = animating === badge;

        return (
          <button
            key={badge}
            onClick={() => handleClick(badge)}
            disabled={readOnly}
            className={cn(
              'w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all',
              isSelected
                ? 'bg-gradient-to-br from-pink-200 to-rose-200 shadow-md'
                : 'bg-white/50 hover:bg-white/80',
              isAnimating && 'animate-bounce',
              readOnly && 'cursor-not-allowed'
            )}
          >
            {badge}
          </button>
        );
      })}
    </div>
  );
}
