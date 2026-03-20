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
                ? 'bg-gradient-to-br from-violet-600/30 to-purple-600/30 shadow-md ring-1 ring-violet-500/30'
                : 'bg-white/5 hover:bg-white/10',
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
