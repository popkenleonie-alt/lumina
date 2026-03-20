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
      className="w-full min-h-[120px] p-3 rounded-xl bg-white/60 border border-violet-200/50 text-foreground placeholder:text-muted-foreground/60 resize-none focus:outline-none focus:ring-2 focus:ring-violet-300 disabled:opacity-60 disabled:cursor-not-allowed"
    />
  );
}
