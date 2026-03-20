'use client';

import { useState, useCallback } from 'react';
import { Plus, ArrowUp, ArrowDown, Lock, Sparkles, Moon, CheckCircle, Heart, UtensilsCrossed, Brain, Award } from 'lucide-react';
import { formatDisplayDate, isTodayCheck } from '@/lib/dateHelpers';
import { useJournalStore, type CustomSectionDefinition } from '@/hooks/useJournalStore';
import { SectionCard } from './SectionCard';
import { AddSectionModal } from './AddSectionModal';
import { AIAssistant } from './sections/AIAssistant';
import { DreamJournal } from './sections/DreamJournal';
import { DoneList } from './sections/DoneList';
import { CycleTracker } from './sections/CycleTracker';
import { FoodJournal } from './sections/FoodJournal';
import { Beliefs } from './sections/Beliefs';
import { Stickers } from './sections/Stickers';
import { CustomSection } from './sections/CustomSection';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

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
    updateCycleTracker,
    updateFoodJournal,
    updateFoodEntries,
    updateBeliefs,
    addCustomSection,
    updateCustomSection,
    deleteCustomSection,
    reorderCustomSections,
    updateCustomSectionData,
  } = useJournalStore(selectedDate);

  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSection, setEditingSection] = useState<CustomSectionDefinition | null>(null);
  const [newName, setNewName] = useState('');
  const [highlightedSections, setHighlightedSections] = useState<Set<string>>(new Set());

  const handleSectionHighlight = useCallback((sectionId: string) => {
    setHighlightedSections((prev) => new Set(prev).add(sectionId));
    setTimeout(() => {
      setHighlightedSections((prev) => {
        const next = new Set(prev);
        next.delete(sectionId);
        return next;
      });
    }, 1500);
  }, []);

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

  const highlightRing = 'ring-2 ring-purple-400 ring-offset-2 transition-all duration-300';

  return (
    <div className="px-4 pb-24">
      {/* Date Header */}
      <div className="flex items-center justify-between py-2">
        <h2 className="font-serif text-lg font-semibold text-violet-100">
          {formatDisplayDate(selectedDate)}
        </h2>
        {readOnly && (
          <span className="flex items-center gap-1 px-2 py-1 rounded-full bg-white/10 text-xs text-violet-300">
            <Lock className="w-3 h-3" />
            Read only
          </span>
        )}
      </div>

      {/* AI Assistant - full width, only show for today */}
      {isToday && (
        <div className="mb-4">
          <SectionCard title="Lumina AI" icon={<Sparkles className="w-5 h-5" />} accentColor="purple">
            <AIAssistant
              journalData={data}
              customSectionDefinitions={customSectionDefinitions}
              onUpdateFoodJournal={updateFoodEntries}
              onUpdateDoneList={updateDoneList}
              onUpdateDreamJournal={updateDreamJournal}
              onUpdateMood={updateCycleTracker}
              onUpdateCustomSectionData={updateCustomSectionData}
              onSectionHighlight={handleSectionHighlight}
            />
          </SectionCard>
        </div>
      )}

      {/* Journal sections — single column on mobile, two columns on md+ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Dream Journal */}
        <div className={cn('rounded-2xl h-full', highlightedSections.has('dream-journal') && highlightRing)}>
          <SectionCard title="Dream Journal" icon={<Moon className="w-5 h-5" />} accentColor="purple">
            <DreamJournal
              value={data.dreamJournal}
              onChange={updateDreamJournal}
              readOnly={readOnly}
            />
          </SectionCard>
        </div>

        {/* Done List */}
        <div className={cn('rounded-2xl h-full', highlightedSections.has('done-list') && highlightRing)}>
          <SectionCard title="Done List" icon={<CheckCircle className="w-5 h-5" />} accentColor="green">
            <DoneList
              items={data.doneList}
              onChange={updateDoneList}
              readOnly={readOnly}
            />
          </SectionCard>
        </div>

        {/* Cycle Tracker */}
        <div className={cn('rounded-2xl h-full', highlightedSections.has('cycle-tracker') && highlightRing)}>
          <SectionCard title="Cycle Tracker" icon={<Heart className="w-5 h-5" />} accentColor="rose">
            <CycleTracker
              data={data.cycleTracker}
              onChange={updateCycleTracker}
              readOnly={readOnly}
            />
          </SectionCard>
        </div>

        {/* Food Journal — spans full width on desktop */}
        <div className={cn('rounded-2xl md:col-span-2', highlightedSections.has('food-journal') && highlightRing)}>
          <SectionCard title="Food Journal" icon={<UtensilsCrossed className="w-5 h-5" />} accentColor="amber">
            <FoodJournal
              entries={data.foodEntries ?? []}
              onChange={updateFoodEntries}
              readOnly={readOnly}
            />
          </SectionCard>
        </div>

        {/* Beliefs */}
        <div className={cn('rounded-2xl md:col-span-2', highlightedSections.has('beliefs') && highlightRing)}>
          <SectionCard title="Beliefs" icon={<Brain className="w-5 h-5" />} accentColor="teal">
            <Beliefs
              entries={data.beliefs ?? []}
              onChange={updateBeliefs}
              readOnly={readOnly}
            />
          </SectionCard>
        </div>

        {/* Stickers & Day Summary */}
        {((data.stickers ?? []).length > 0 || data.daySummary) && (
          <div className="rounded-2xl md:col-span-2">
            <SectionCard title="Day Reflection" icon={<Award className="w-5 h-5" />} accentColor="amber">
              <Stickers
                stickerIds={data.stickers ?? []}
                daySummary={data.daySummary ?? ''}
              />
            </SectionCard>
          </div>
        )}

        {/* Custom Sections */}
        {customSectionDefinitions
          .sort((a, b) => a.order - b.order)
          .map((section, index) => (
            <div key={section.id} className="relative group">
              <div className={cn('rounded-2xl h-full', highlightedSections.has(`custom-${section.id}`) && highlightRing)}>
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
              </div>
              {isToday && customSectionDefinitions.length > 1 && (
                <div className="absolute -right-2 top-1/2 -translate-y-1/2 flex flex-col gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {index > 0 && (
                    <button
                      onClick={() => reorderCustomSections(index, index - 1)}
                      className="p-1 rounded bg-white/10 shadow-sm hover:bg-white/20 text-violet-300"
                    >
                      <ArrowUp className="w-3 h-3" />
                    </button>
                  )}
                  {index < customSectionDefinitions.length - 1 && (
                    <button
                      onClick={() => reorderCustomSections(index, index + 1)}
                      className="p-1 rounded bg-white/10 shadow-sm hover:bg-white/20 text-violet-300"
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
            className="w-full py-3 rounded-2xl border-2 border-dashed border-violet-500/40 text-violet-400 flex items-center justify-center gap-2 hover:bg-violet-500/10 transition-colors md:col-span-2"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Add Section</span>
          </button>
        )}
      </div>

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
