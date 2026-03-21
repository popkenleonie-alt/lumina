'use client';

import { useState, useRef } from 'react';
import { Plus, Trash2, Camera, X, Clock, ChevronDown, ChevronUp } from 'lucide-react';
import type { FoodEntry } from '@/hooks/useJournalStore';

interface FoodJournalProps {
  entries: FoodEntry[];
  onChange: (entries: FoodEntry[]) => void;
  readOnly?: boolean;
}

function formatTime(isoString: string): string {
  return new Date(isoString).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });
}

function toTimeValue(isoString: string): string {
  const d = new Date(isoString);
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

export function FoodJournal({ entries, onChange, readOnly }: FoodJournalProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const addEntry = () => {
    const newEntry: FoodEntry = {
      id: `food-${Date.now()}`,
      timestamp: new Date().toISOString(),
      what: '',
      why: '',
      feelingBefore: '',
      feelingAfter: '',
      photos: [],
    };
    onChange([...entries, newEntry]);
    setExpandedId(newEntry.id);
  };

  const updateEntry = (id: string, field: keyof Omit<FoodEntry, 'id'>, value: string | string[]) => {
    onChange(entries.map((e) => (e.id === id ? { ...e, [field]: value } : e)));
  };

  const removeEntry = (id: string) => {
    onChange(entries.filter((e) => e.id !== id));
    if (expandedId === id) setExpandedId(null);
  };

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  return (
    <div className="space-y-3">
      {entries.map((entry) => (
        <FoodEntryCard
          key={entry.id}
          entry={entry}
          expanded={expandedId === entry.id}
          onToggle={() => toggleExpand(entry.id)}
          onUpdate={(field, value) => updateEntry(entry.id, field, value)}
          onRemove={() => removeEntry(entry.id)}
          readOnly={readOnly}
        />
      ))}

      {!readOnly && (
        <button
          onClick={addEntry}
          className="w-full py-2.5 rounded-xl border border-dashed border-violet-500/30 text-violet-400 text-sm flex items-center justify-center gap-1.5 hover:bg-violet-500/10 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Log something I ate
        </button>
      )}

      {entries.length === 0 && readOnly && (
        <p className="text-sm text-violet-400/50 text-center py-3">
          No food logged
        </p>
      )}
    </div>
  );
}

interface FoodEntryCardProps {
  entry: FoodEntry;
  expanded: boolean;
  onToggle: () => void;
  onUpdate: (field: keyof Omit<FoodEntry, 'id'>, value: string | string[]) => void;
  onRemove: () => void;
  readOnly?: boolean;
}

function FoodEntryCard({ entry, expanded, onToggle, onUpdate, onRemove, readOnly }: FoodEntryCardProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        onUpdate('photos', [...entry.photos, base64]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    onUpdate('photos', entry.photos.filter((_, i) => i !== index));
  };

  const preview = entry.what || 'New entry...';

  return (
    <div className="rounded-xl bg-white/5 border border-violet-500/20 overflow-hidden">
      {/* Header */}
      <button
        type="button"
        onClick={onToggle}
        className="w-full flex items-center justify-between px-3 py-2.5 text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center gap-1 text-xs text-amber-400/70 shrink-0">
            <Clock className="w-3 h-3" />
            {readOnly ? (
              formatTime(entry.timestamp)
            ) : (
              <input
                type="time"
                value={toTimeValue(entry.timestamp)}
                onChange={(e) => {
                  e.stopPropagation();
                  const d = new Date(entry.timestamp);
                  const [hours, minutes] = e.target.value.split(':').map(Number);
                  d.setHours(hours, minutes);
                  onUpdate('timestamp', d.toISOString());
                }}
                onClick={(e) => e.stopPropagation()}
                className="text-xs text-amber-400/70 bg-transparent border-none outline-none cursor-pointer hover:text-amber-300 [&::-webkit-calendar-picker-indicator]:hidden"
              />
            )}
          </div>
          <span className="text-sm text-violet-200 truncate">{preview}</span>
        </div>
        {expanded ? (
          <ChevronUp className="w-4 h-4 text-violet-400 shrink-0" />
        ) : (
          <ChevronDown className="w-4 h-4 text-violet-400 shrink-0" />
        )}
      </button>

      {/* Expanded */}
      {expanded && (
        <div className="px-3 pb-3 space-y-3 border-t border-violet-500/10">
          <div className="pt-3">
            <label className="text-xs font-medium text-amber-400 mb-1 block">
              What did I eat?
            </label>
            <input
              type="text"
              value={entry.what}
              onChange={(e) => onUpdate('what', e.target.value)}
              placeholder="Describe what you ate or drank"
              disabled={readOnly}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-amber-500/20 text-sm text-violet-100 placeholder:text-violet-400/40 focus:outline-none focus:ring-2 focus:ring-amber-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-violet-400 mb-1 block">
              Why did I eat?
            </label>
            <input
              type="text"
              value={entry.why}
              onChange={(e) => onUpdate('why', e.target.value)}
              placeholder="Hungry, bored, stressed, social, craving..."
              disabled={readOnly}
              className="w-full px-3 py-2 rounded-lg bg-white/5 border border-violet-500/20 text-sm text-violet-100 placeholder:text-violet-400/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-medium text-blue-400 mb-1 block">
                Feeling before
              </label>
              <input
                type="text"
                value={entry.feelingBefore}
                onChange={(e) => onUpdate('feelingBefore', e.target.value)}
                placeholder="e.g. anxious, tired"
                disabled={readOnly}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-blue-500/20 text-sm text-violet-100 placeholder:text-violet-400/40 focus:outline-none focus:ring-2 focus:ring-blue-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-emerald-400 mb-1 block">
                Feeling after
              </label>
              <input
                type="text"
                value={entry.feelingAfter}
                onChange={(e) => onUpdate('feelingAfter', e.target.value)}
                placeholder="e.g. satisfied, guilty"
                disabled={readOnly}
                className="w-full px-3 py-2 rounded-lg bg-white/5 border border-emerald-500/20 text-sm text-violet-100 placeholder:text-violet-400/40 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 disabled:opacity-60 disabled:cursor-not-allowed"
              />
            </div>
          </div>

          {/* Photos */}
          {entry.photos.length > 0 && (
            <div className="grid grid-cols-4 gap-2">
              {entry.photos.map((photo, index) => (
                <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
                  <img src={photo} alt="" className="w-full h-full object-cover" />
                  {!readOnly && (
                    <button
                      onClick={() => removePhoto(index)}
                      className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white transition-opacity"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

          {!readOnly && (
            <div className="flex items-center justify-between">
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center gap-1 text-xs text-violet-400 hover:text-violet-300 transition-colors"
              >
                <Camera className="w-3.5 h-3.5" />
                Add photo
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                onChange={handlePhotoUpload}
                className="hidden"
              />
              <button
                onClick={onRemove}
                className="flex items-center gap-1 text-xs text-red-400/70 hover:text-red-400 transition-colors"
              >
                <Trash2 className="w-3 h-3" />
                Remove
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
