'use client';

import { STICKER_MAP } from '@/lib/stickers';

interface StickersProps {
  stickerIds: string[];
  daySummary: string;
}

export function Stickers({ stickerIds, daySummary }: StickersProps) {
  if (stickerIds.length === 0 && !daySummary) return null;

  return (
    <div className="space-y-4">
      {stickerIds.length > 0 && (
        <div className="flex items-center justify-center gap-4 py-2">
          {stickerIds.map((id, i) => {
            const sticker = STICKER_MAP[id];
            if (!sticker) return null;
            return (
              <div
                key={id}
                className="flex flex-col items-center gap-1 animate-[pop-in_0.4s_ease-out_both]"
                style={{ animationDelay: `${i * 0.15}s` }}
              >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={sticker.url}
                  alt={sticker.label}
                  className="w-14 h-14 drop-shadow-lg"
                />
                <span className="text-[10px] text-violet-400">
                  {sticker.label}
                </span>
              </div>
            );
          })}
        </div>
      )}

      {daySummary && (
        <p className="text-violet-100 text-sm leading-relaxed whitespace-pre-wrap">
          {daySummary}
        </p>
      )}
    </div>
  );
}
