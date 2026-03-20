'use client';

import { Sunset } from 'lucide-react';

interface FloatingButtonProps {
  onClick: () => void;
  visible: boolean;
}

export function FloatingButton({ onClick, visible }: FloatingButtonProps) {
  if (!visible) return null;

  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 px-5 py-3 rounded-full bg-gradient-to-br from-violet-600 to-purple-700 text-white shadow-lg shadow-violet-500/30 flex items-center gap-2 hover:scale-105 transition-transform duration-200 z-50"
      aria-label="Finish the Day"
    >
      <Sunset className="w-5 h-5" />
      <span className="text-sm font-medium">Finish the Day</span>
    </button>
  );
}
