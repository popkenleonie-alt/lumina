'use client';

import { useState } from 'react';
import { Plus, ArrowUp, ArrowDown, Lock } from 'lucide-react';
import { formatDisplayDate, isTodayCheck } from '@/lib/dateHelpers';
import { useJournalStore, type CustomSectionDefinition } from '@/hooks/useJournalStore';
import { SectionCard } from './SectionCard';
import { AddSectionModal } from './AddSectionModal';
import { AIAssistant } from './sections/AIAssistant';
import { DreamJournal } from './sections/DreamJournal';
import { DoneList } from './sections/DoneList';
import { Badges } from './sections/Badges';
import { CycleTracker } from './sections/CycleTracker';
import { FoodJournal } from './sections/FoodJournal';
import { CustomSection } from './sections/CustomSection';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface DayViewProps {
  selectedDate: Date;
}

export function DayView({ selectedDate }: DayViewProps) {
  const isToday = isTodayCheck(selectedDate);
  const readOnly = !isToday;

  const {
    data,
    customSectionDefinitions,
    isLoaded,
    updateDreamJournal,
    updateDoneList,
    toggleBadge,
    updateCycleTracker,
    updateFoodJournal,
    addCustomSection,
    updateCustomSection,
    deleteCustomSection,
    reorderCustomSections,
    updateCustomSectionData,
  } = useJournalStore(selectedDate);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSection, setEditingSection] = useState<CustomSectionDefinition | null>(null);
  const [newName, setNewName] = useState('');

  const handleRename = (section: CustomSectionDefinition) => {
    setEditingSection(section);
    setNewName(section.name);
  };

  const saveRename = () => {
    if (editingSection && newName.trim()) {
      updateCustomSection(editingSection.id, { name: newName.trim() });
    }
    setEditingSection(null);
    setNewName('');
  };

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-8 h-8 border-3 border-pink-400 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="px-4 pb-24 space-y-4">
      {/* Date Header */}
      <div className="flex items-center justify-between py-2">
        <h2 className="font-serif text-lg font-semibold text-foreground">
          {formatDisplayDate(selectedDate)}
        </h2>
        {readOnly && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-muted text-xs text-muted-foreground">
            <Lock className="w-3 h-3" />
            Read only
          </span>
        )}
      </div>

      {/* AI Assistant - only show for today */}
      {isToday && (
        <SectionCard title="Lumina AI" icon="✨" accentColor="purple">
          <AIAssistant
            journalData={data}
            onInsertToDream={(text) => {
              const current = data.dreamJournal;
              updateDreamJournal(current ? `${current}\n\n${text}` : text);
            }}
            onInsertToDone={(text) => {
              // Parse text for list items and add them
              const lines = text.split('\n').filter((l) => l.trim());
              const newItems = lines.map((line, i) => ({
                id: `ai-${Date.now()}-${i}`,
                text: line.replace(/^[-•*\d.]+\s*/, '').trim(),
                checked: false,
              }));
              updateDoneList([...data.doneList, ...newItems]);
            }}
          />
        </SectionCard>
      )}

      {/* Dream Journal */}
      <SectionCard title="Dream Journal" icon="🌙" accentColor="purple">
        <DreamJournal
          value={data.dreamJournal}
          onChange={updateDreamJournal}
          readOnly={readOnly}
        />
      </SectionCard>

      {/* Done List */}
      <SectionCard title="Done List" icon="✅" accentColor="green">
        <DoneList
          items={data.doneList}
          onChange={updateDoneList}
          readOnly={readOnly}
        />
      </SectionCard>

      {/* Badges */}
      <SectionCard title="Badges" icon="🏆" accentColor="pink">
        <Badges
          selectedBadges={data.badges}
          onToggle={toggleBadge}
          readOnly={readOnly}
        />
      </SectionCard>

      {/* Cycle Tracker */}
      <SectionCard title="Cycle Tracker" icon="🌸" accentColor="rose">
        <CycleTracker
          data={data.cycleTracker}
          onChange={updateCycleTracker}
          readOnly={readOnly}
        />
      </SectionCard>

      {/* Food Journal */}
      <SectionCard title="Food Journal" icon="🍽️" accentColor="amber">
        <FoodJournal
          data={data.foodJournal}
          onChange={updateFoodJournal}
          readOnly={readOnly}
        />
      </SectionCard>

      {/* Custom Sections */}
      {customSectionDefinitions
        .sort((a, b) => a.order - b.order)
        .map((section, index) => (
          <div key={section.id} className="relative group">
            <SectionCard
              title={section.name}
              icon={section.icon}
              accentColor={section.color}
              showMenu={isToday}
              onRename={() => handleRename(section)}
              onChangeColor={() => {
                const colors = ['purple', 'pink', 'rose', 'green', 'blue', 'teal', 'amber', 'orange'];
                const currentIndex = colors.indexOf(section.color);
                const nextColor = colors[(currentIndex + 1) % colors.length];
                updateCustomSection(section.id, { color: nextColor });
              }}
              onDelete={() => deleteCustomSection(section.id)}
            >
              <CustomSection
                definition={section}
                data={data.customSections[section.id] || {}}
                onChange={(sectionData) => updateCustomSectionData(section.id, sectionData)}
                readOnly={readOnly}
              />
            </SectionCard>
            {isToday && customSectionDefinitions.length > 1 && (
              <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {index > 0 && (
                  <button
                    onClick={() => reorderCustomSections(index, index - 1)}
                    className="p-1 rounded bg-white/80 shadow-sm hover:bg-white"
                  >
                    <ArrowUp className="w-3 h-3" />
                  </button>
                )}
                {index < customSectionDefinitions.length - 1 && (
                  <button
                    onClick={() => reorderCustomSections(index, index + 1)}
                    className="p-1 rounded bg-white/80 shadow-sm hover:bg-white"
                  >
                    <ArrowDown className="w-3 h-3" />
                  </button>
                )}
              </div>
            )}
          </div>
        ))}

      {/* Add Section Button */}
      {isToday && (
        <button
          onClick={() => setShowAddModal(true)}
          className="w-full py-3 rounded-2xl border-2 border-dashed border-pink-300 text-pink-500 flex items-center justify-center gap-2 hover:bg-pink-50/50 transition-colors"
        >
          <Plus className="w-5 h-5" />
          <span className="font-medium">Add Section</span>
        </button>
      )}

      {/* Add Section Modal */}
      <AddSectionModal
        isOpen={showAddModal}
        onClose={() => setShowAddModal(false)}
        onAdd={addCustomSection}
      />

      {/* Rename Dialog */}
      <Dialog open={!!editingSection} onOpenChange={() => setEditingSection(null)}>
        <DialogContent className="max-w-[360px]">
          <DialogHeader>
            <DialogTitle>Rename Section</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-2">
            <Input
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Section name"
              autoFocus
            />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={() => setEditingSection(null)}>
                Cancel
              </Button>
              <Button onClick={saveRename}>Save</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
