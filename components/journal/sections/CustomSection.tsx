'use client';

import { useState, useRef } from 'react';
import { Plus, X, Camera, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { CustomSectionData, ChecklistItem, CustomSectionDefinition } from '@/hooks/useJournalStore';

interface CustomSectionProps {
  definition: CustomSectionDefinition;
  data: CustomSectionData;
  onChange: (data: CustomSectionData) => void;
  readOnly?: boolean;
}

export function CustomSection({ definition, data, onChange, readOnly }: CustomSectionProps) {
  switch (definition.type) {
    case 'text':
      return <TextSection value={data.text || ''} onChange={(text) => onChange({ ...data, text })} readOnly={readOnly} color={definition.color} />;
    case 'checklist':
      return <ChecklistSection items={data.checklist || []} onChange={(checklist) => onChange({ ...data, checklist })} readOnly={readOnly} color={definition.color} />;
    case 'photo':
      return <PhotoSection photos={data.photos || []} onChange={(photos) => onChange({ ...data, photos })} readOnly={readOnly} color={definition.color} />;
    case 'rating':
      return <RatingSection value={data.rating || 0} onChange={(rating) => onChange({ ...data, rating })} readOnly={readOnly} color={definition.color} />;
    default:
      return null;
  }
}

function TextSection({ value, onChange, readOnly, color }: { value: string; onChange: (v: string) => void; readOnly?: boolean; color: string }) {
  const borderColor = {
    purple: 'focus:ring-violet-300',
    pink: 'focus:ring-pink-300',
    rose: 'focus:ring-rose-300',
    green: 'focus:ring-emerald-300',
    blue: 'focus:ring-blue-300',
    teal: 'focus:ring-teal-300',
    amber: 'focus:ring-amber-300',
    orange: 'focus:ring-orange-300',
  }[color] || 'focus:ring-gray-300';

  return (
    <textarea
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder="Write something..."
      disabled={readOnly}
      className={cn(
        'w-full min-h-[100px] p-3 rounded-xl bg-white/5 border border-violet-500/20 text-violet-100 placeholder:text-violet-400/40 resize-none focus:outline-none focus:ring-2 disabled:opacity-60 disabled:cursor-not-allowed',
        borderColor
      )}
    />
  );
}

function ChecklistSection({ items, onChange, readOnly, color }: { items: ChecklistItem[]; onChange: (items: ChecklistItem[]) => void; readOnly?: boolean; color: string }) {
  const [newItem, setNewItem] = useState('');

  const checkColor = {
    purple: 'bg-violet-400 border-violet-400',
    pink: 'bg-pink-400 border-pink-400',
    rose: 'bg-rose-400 border-rose-400',
    green: 'bg-emerald-400 border-emerald-400',
    blue: 'bg-blue-400 border-blue-400',
    teal: 'bg-teal-400 border-teal-400',
    amber: 'bg-amber-400 border-amber-400',
    orange: 'bg-orange-400 border-orange-400',
  }[color] || 'bg-gray-400 border-gray-400';

  const addItem = () => {
    if (!newItem.trim()) return;
    onChange([...items, { id: `item-${Date.now()}`, text: newItem.trim(), checked: false }]);
    setNewItem('');
  };

  const toggleItem = (id: string) => {
    onChange(items.map((item) => (item.id === id ? { ...item, checked: !item.checked } : item)));
  };

  const removeItem = (id: string) => {
    onChange(items.filter((item) => item.id !== id));
  };

  return (
    <div className="space-y-2">
      {items.map((item) => (
        <div key={item.id} className="flex items-center gap-3 p-2 rounded-lg bg-white/5 group">
          <button
            onClick={() => !readOnly && toggleItem(item.id)}
            disabled={readOnly}
            className={cn(
              'w-5 h-5 rounded-md border-2 flex items-center justify-center transition-colors',
              item.checked ? checkColor : 'border-gray-300 hover:border-gray-400'
            )}
          >
            {item.checked && (
              <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
              </svg>
            )}
          </button>
          <span className={cn('flex-1 text-sm text-violet-100', item.checked && 'line-through text-violet-400/50')}>
            {item.text}
          </span>
          {!readOnly && (
            <button onClick={() => removeItem(item.id)} className="opacity-0 group-hover:opacity-100 p-1 rounded hover:bg-white/10">
              <X className="w-4 h-4 text-violet-400" />
            </button>
          )}
        </div>
      ))}
      {!readOnly && (
        <div className="flex gap-2 mt-3">
          <input
            type="text"
            value={newItem}
            onChange={(e) => setNewItem(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addItem()}
            placeholder="Add new item..."
            className="flex-1 px-3 py-2 rounded-lg bg-white/5 border border-violet-500/20 text-sm text-violet-100 placeholder:text-violet-400/40 focus:outline-none focus:ring-2 focus:ring-violet-500/50"
          />
          <button onClick={addItem} className="px-3 py-2 rounded-lg bg-violet-500/20 text-violet-300 hover:bg-violet-500/30">
            <Plus className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}

function PhotoSection({ photos, onChange, readOnly, color }: { photos: string[]; onChange: (photos: string[]) => void; readOnly?: boolean; color: string }) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const btnColor = 'bg-violet-500/20 text-violet-300 hover:bg-violet-500/30';

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChange([...photos, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
  };

  return (
    <div className="space-y-3">
      {!readOnly && (
        <>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleUpload} className="hidden" />
          <button onClick={() => fileInputRef.current?.click()} className={cn('w-full py-3 rounded-xl flex items-center justify-center gap-2 transition-colors', btnColor)}>
            <Camera className="w-4 h-4" />
            <span className="text-sm font-medium">Add Photos</span>
          </button>
        </>
      )}
      {photos.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {photos.map((photo, index) => (
            <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
              <img src={photo} alt="" className="w-full h-full object-cover" />
              {!readOnly && (
                <button
                  onClick={() => onChange(photos.filter((_, i) => i !== index))}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/50 text-white opacity-0 group-hover:opacity-100"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function RatingSection({ value, onChange, readOnly, color }: { value: number; onChange: (v: number) => void; readOnly?: boolean; color: string }) {
  const starColor = 'text-violet-400';

  return (
    <div className="flex gap-2 justify-center py-2">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          onClick={() => !readOnly && onChange(star)}
          disabled={readOnly}
          className={cn('transition-transform hover:scale-110', readOnly && 'cursor-not-allowed')}
        >
          <Star className={cn('w-8 h-8', star <= value ? starColor : 'text-white/10', star <= value && 'fill-current')} />
        </button>
      ))}
    </div>
  );
}
