'use client';

import { Plus } from 'lucide-react';

interface FloatingButtonProps {
  onClick: () => void;
}

export function FloatingButton({ onClick }: FloatingButtonProps) {
  return (
    <button
      onClick={onClick}
      className="fixed bottom-6 left-1/2 -translate-x-1/2 w-14 h-14 rounded-full bg-gradient-to-br from-pink-400 via-rose-400 to-violet-500 text-white shadow-lg shadow-pink-400/40 flex items-center justify-center animate-pulse hover:animate-none hover:scale-110 transition-transform duration-200 z-50"
      aria-label="Add content"
    >
      <Plus className="w-7 h-7" />
    </button>
  );
}
