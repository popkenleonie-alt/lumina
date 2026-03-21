'use client';

import { useRef } from 'react';
import { ImagePlus, X } from 'lucide-react';

interface AdditionalThoughtsProps {
  text: string;
  photos: string[];
  onChangeText: (text: string) => void;
  onChangePhotos: (photos: string[]) => void;
  readOnly?: boolean;
}

export function AdditionalThoughts({ text, photos, onChangeText, onChangePhotos, readOnly }: AdditionalThoughtsProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleAddPhotos = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        onChangePhotos([...photos, event.target?.result as string]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = '';
  };

  return (
    <div className="space-y-3">
      <textarea
        value={text}
        onChange={(e) => onChangeText(e.target.value)}
        placeholder="Anything else on your mind..."
        readOnly={readOnly}
        className="w-full min-h-[100px] bg-white/5 border border-violet-500/20 rounded-xl px-3 py-2 text-sm text-violet-100 placeholder:text-violet-400/50 focus:outline-none focus:ring-1 focus:ring-violet-400/50 resize-y"
      />

      {!readOnly && (
        <>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleAddPhotos}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-violet-500/20 text-violet-300 hover:bg-violet-500/30 text-sm transition-colors"
          >
            <ImagePlus className="w-4 h-4" />
            Add photos
          </button>
        </>
      )}

      {photos.length > 0 && (
        <div className="grid grid-cols-3 gap-2">
          {photos.map((photo, index) => (
            <div key={index} className="relative aspect-square rounded-xl overflow-hidden group">
              <img src={photo} alt="" className="w-full h-full object-cover" />
              {!readOnly && (
                <button
                  onClick={() => onChangePhotos(photos.filter((_, i) => i !== index))}
                  className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white transition-opacity"
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
