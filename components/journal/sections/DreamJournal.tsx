'use client';

interface DreamJournalProps {
  value: string;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

export function DreamJournal({ value, onChange, readOnly }: DreamJournalProps) {
  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="What did you dream about..."
      disabled={readOnly}
      className="w-full min-h-[120px] p-3 rounded-xl bg-white/5 border border-violet-500/20 text-violet-100 placeholder:text-violet-400/40 resize-none focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
    />
  );
}
