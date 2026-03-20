'use client';

import { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface AddSectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (section: {
    name: string;
    icon: string;
    color: string;
    type: 'text' | 'checklist' | 'photo' | 'rating';
  }) => void;
}

const emojiOptions = ['📝', '🎵', '💊', '🏃', '💬', '📷', '🌍', '💡', '🧠', '💤', '🎨', '📖', '🎯', '✏️', '🌸', '🌈'];
const colorOptions = [
  { name: 'purple', bg: 'bg-violet-400' },
  { name: 'pink', bg: 'bg-pink-400' },
  { name: 'rose', bg: 'bg-rose-400' },
  { name: 'green', bg: 'bg-emerald-400' },
  { name: 'blue', bg: 'bg-blue-400' },
  { name: 'teal', bg: 'bg-teal-400' },
  { name: 'amber', bg: 'bg-amber-400' },
  { name: 'orange', bg: 'bg-orange-400' },
];
const typeOptions: { value: 'text' | 'checklist' | 'photo' | 'rating'; label: string; description: string }[] = [
  { value: 'text', label: 'Text', description: 'Simple textarea' },
  { value: 'checklist', label: 'Checklist', description: 'Add/remove items' },
  { value: 'photo', label: 'Photo Grid', description: 'Upload photos' },
  { value: 'rating', label: 'Rating', description: '1-5 star scale' },
];

export function AddSectionModal({ isOpen, onClose, onAdd }: AddSectionModalProps) {
  const [name, setName] = useState('');
  const [selectedIcon, setSelectedIcon] = useState('📝');
  const [selectedColor, setSelectedColor] = useState('purple');
  const [selectedType, setSelectedType] = useState<'text' | 'checklist' | 'photo' | 'rating'>('text');

  const handleAdd = () => {
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      icon: selectedIcon,
      color: selectedColor,
      type: selectedType,
    });
    setName('');
    setSelectedIcon('📝');
    setSelectedColor('purple');
    setSelectedType('text');
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50" onClick={onClose} />
      <div className="fixed bottom-0 left-0 right-0 z-50 flex justify-center">
        <div className="w-full max-w-[430px] md:max-w-lg bg-gray-900/95 backdrop-blur-md rounded-t-3xl shadow-2xl p-6 animate-in slide-in-from-bottom duration-300">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-serif text-xl font-semibold text-violet-100">Add Custom Section</h2>
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-white/10 transition-colors text-violet-300"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-5">
            <div>
              <label className="text-sm font-medium text-violet-300 mb-2 block">
                Section Name
              </label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Enter section name..."
                className="bg-white/80"
              />
            </div>

            <div>
              <label className="text-sm font-medium text-violet-300 mb-2 block">
                Choose an Icon
              </label>
              <div className="flex flex-wrap gap-2">
                {emojiOptions.map((emoji) => (
                  <button
                    key={emoji}
                    onClick={() => setSelectedIcon(emoji)}
                    className={cn(
                      'w-10 h-10 rounded-xl flex items-center justify-center text-xl transition-all',
                      selectedIcon === emoji
                        ? 'bg-gradient-to-br from-violet-600/40 to-purple-600/40 scale-110 shadow-md'
                        : 'bg-white/5 hover:bg-white/10'
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-violet-300 mb-2 block">
                Accent Color
              </label>
              <div className="flex gap-3">
                {colorOptions.map((color) => (
                  <button
                    key={color.name}
                    onClick={() => setSelectedColor(color.name)}
                    className={cn(
                      'w-8 h-8 rounded-full transition-all',
                      color.bg,
                      selectedColor === color.name
                        ? 'ring-2 ring-offset-2 ring-foreground scale-110'
                        : 'hover:scale-105'
                    )}
                  />
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-violet-300 mb-2 block">
                Section Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {typeOptions.map((type) => (
                  <button
                    key={type.value}
                    onClick={() => setSelectedType(type.value)}
                    className={cn(
                      'p-3 rounded-xl text-left transition-all',
                      selectedType === type.value
                        ? 'bg-violet-500/15 ring-2 ring-violet-500/50'
                        : 'bg-white/5 hover:bg-white/10'
                    )}
                  >
                    <div className="font-medium text-sm text-violet-100">{type.label}</div>
                    <div className="text-xs text-violet-400">{type.description}</div>
                  </button>
                ))}
              </div>
            </div>

            <Button
              onClick={handleAdd}
              disabled={!name.trim()}
              className="w-full bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white rounded-xl py-3"
            >
              Add Section
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}
