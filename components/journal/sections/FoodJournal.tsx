'use client';

import { useRef } from 'react';
import { Camera, X, Sunrise, Sun, Sunset, Cookie, type LucideIcon } from 'lucide-react';
import type { MealEntry, DayData } from '@/hooks/useJournalStore';

interface FoodJournalProps {
  data: DayData['foodJournal'];
  onChange: (meal: keyof DayData['foodJournal'], entry: Partial<MealEntry>) => void;
  readOnly?: boolean;
}

const meals: { key: keyof DayData['foodJournal']; label: string; icon: LucideIcon }[] = [
  { key: 'morning', label: 'Morning', icon: Sunrise },
  { key: 'noon', label: 'Noon', icon: Sun },
  { key: 'evening', label: 'Evening', icon: Sunset },
  { key: 'snacks', label: 'Snacks', icon: Cookie },
];

export function FoodJournal({ data, onChange, readOnly }: FoodJournalProps) {
  return (
    <div className="space-y-4">
      {meals.map((meal) => (
        <MealInput
          key={meal.key}
          label={meal.label}
          icon={meal.icon}
          value={data[meal.key]}
          onChange={(entry) => onChange(meal.key, entry)}
          readOnly={readOnly}
        />
      ))}
    </div>
  );
}

interface MealInputProps {
  label: string;
  icon: LucideIcon;
  value: MealEntry;
  onChange: (entry: Partial<MealEntry>) => void;
  readOnly?: boolean;
}

function MealInput({ label, icon: Icon, value, onChange, readOnly }: MealInputProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const base64 = event.target?.result as string;
        onChange({ photos: [...value.photos, base64] });
      };
      reader.readAsDataURL(file);
    });
  };

  const removePhoto = (index: number) => {
    onChange({ photos: value.photos.filter((_, i) => i !== index) });
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-muted-foreground" />
        <span className="text-xs font-medium text-muted-foreground">{label}</span>
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={value.text}
          onChange={(e) => onChange({ text: e.target.value })}
          placeholder={`What did you have for ${label.toLowerCase()}?`}
          disabled={readOnly}
          className="flex-1 px-3 py-2 rounded-lg bg-white/60 border border-amber-200/50 text-sm placeholder:text-muted-foreground/60 focus:outline-none focus:ring-2 focus:ring-amber-300 disabled:opacity-60 disabled:cursor-not-allowed"
        />
        {!readOnly && (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="px-3 py-2 rounded-lg bg-amber-100 text-amber-600 hover:bg-amber-200 transition-colors"
            >
              <Camera className="w-4 h-4" />
            </button>
          </>
        )}
      </div>
      {value.photos.length > 0 && (
        <div className="grid grid-cols-4 gap-2 mt-2">
          {value.photos.map((photo, index) => (
            <div key={index} className="relative aspect-square rounded-lg overflow-hidden group">
              <img src={photo} alt="" className="w-full h-full object-cover" />
              {!readOnly && (
                <button
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
