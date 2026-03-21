'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Send, Sparkles, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type {
  DayData,
  ChecklistItem,
  FoodEntry,
  CycleData,
  CustomSectionData,
  CustomSectionDefinition,
} from '@/hooks/useJournalStore';

interface AIAssistantProps {
  journalData: DayData;
  customSectionDefinitions: CustomSectionDefinition[];
  onUpdateFoodJournal: (entries: FoodEntry[]) => void;
  onUpdateDoneList: (items: ChecklistItem[]) => void;
  onUpdateDreamJournal: (text: string) => void;
  onUpdateMood: (data: Partial<CycleData>) => void;
  onUpdateCustomSectionData: (sectionId: string, data: CustomSectionData) => void;
  onSectionHighlight?: (sectionId: string) => void;
}

function getMessageText(parts: Array<{ type: string; text?: string }>): string {
  return parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text' && !!p.text)
    .map((p) => p.text)
    .join('');
}

interface ToolCallPill {
  id: string;
  icon: string;
  label: string;
}

const TOOL_PILL_MAP: Record<string, { icon: string; label: (args: Record<string, unknown>) => string }> = {
  update_food_journal: {
    icon: '🍽️',
    label: (args) => `Logged ${args.what || 'food'}`,
  },
  add_done_items: {
    icon: '✅',
    label: (args) => `Added ${(args.items as string[]).length} item${(args.items as string[]).length > 1 ? 's' : ''}`,
  },
  update_dream_journal: {
    icon: '🌙',
    label: () => 'Updated dream journal',
  },
  update_mood: {
    icon: '🌸',
    label: (args) => `Set mood to ${args.mood}`,
  },
  update_custom_section: {
    icon: '📝',
    label: (args) => `Updated "${args.sectionName}"`,
  },
};

export function AIAssistant({
  journalData,
  customSectionDefinitions,
  onUpdateFoodJournal,
  onUpdateDoneList,
  onUpdateDreamJournal,
  onUpdateMood,
  onUpdateCustomSectionData,
  onSectionHighlight,
}: AIAssistantProps) {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [toolCallPills, setToolCallPills] = useState<Record<string, ToolCallPill[]>>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Use refs to always have latest data in the onToolCall callback
  const journalDataRef = useRef(journalData);
  journalDataRef.current = journalData;
  const customSectionDefsRef = useRef(customSectionDefinitions);
  customSectionDefsRef.current = customSectionDefinitions;

  // Build context from journal data — use refs so transport body stays current
  const contextRef = useRef('');
  contextRef.current = `
Dream Journal: ${journalData.dreamJournal || '(empty)'}
Done List: ${journalData.doneList.map((i) => `${i.checked ? '✓' : '○'} ${i.text}`).join(', ') || '(empty)'}
Badges earned: ${journalData.badges.join(', ') || '(none)'}
Mood: ${journalData.cycleTracker.mood || 'Not set'}
Food entries: ${(journalData.foodEntries ?? []).length > 0 ? journalData.foodEntries.map((e) => `${new Date(e.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - ${e.what}${e.why ? ` (why: ${e.why})` : ''}`).join('; ') : '(none)'}
`;

  const customSectionsRef = useRef<{ name: string; type: string }[]>([]);
  customSectionsRef.current = customSectionDefinitions.map((s) => ({
    name: s.name,
    type: s.type,
  }));

  // Stable body object with getters — reads current ref values at serialization time
  const body = useMemo(() => {
    const obj = {};
    Object.defineProperty(obj, 'context', { get: () => contextRef.current, enumerable: true });
    Object.defineProperty(obj, 'customSections', { get: () => customSectionsRef.current, enumerable: true });
    Object.defineProperty(obj, 'currentTime', { get: () => new Date().toLocaleTimeString(), enumerable: true });
    return obj;
  }, []);

  // Stable transport — never recreated, avoids useChat re-initialization
  const transport = useMemo(
    () => new DefaultChatTransport({ api: '/api/journal-ai', body }),
    [body],
  );

  const { messages, sendMessage, status } = useChat({
    transport,
    onToolCall: ({ toolCall }) => {
      const { toolName, input, toolCallId } = toolCall as { toolName: string; input: Record<string, unknown>; toolCallId: string };
      const data = journalDataRef.current;

      // Execute tool
      switch (toolName) {
        case 'update_food_journal': {
          const newEntry: FoodEntry = {
            id: `ai-food-${Date.now()}`,
            timestamp: new Date().toISOString(),
            what: (input.what as string) || '',
            why: (input.why as string) || '',
            feelingBefore: (input.feelingBefore as string) || '',
            feelingAfter: (input.feelingAfter as string) || '',
            photos: [],
          };
          onUpdateFoodJournal([...(data.foodEntries ?? []), newEntry]);
          onSectionHighlight?.('food-journal');
          break;
        }
        case 'add_done_items': {
          const items = input.items as string[];
          const newItems: ChecklistItem[] = items.map((text, i) => ({
            id: `ai-${Date.now()}-${i}`,
            text,
            checked: true,
            timestamp: new Date().toISOString(),
          }));
          onUpdateDoneList([...data.doneList, ...newItems]);
          onSectionHighlight?.('done-list');
          break;
        }
        case 'update_dream_journal': {
          const text = input.text as string;
          const existing = data.dreamJournal;
          onUpdateDreamJournal(existing ? `${existing}\n\n${text}` : text);
          onSectionHighlight?.('dream-journal');
          break;
        }
        case 'update_mood': {
          const mood = input.mood as string;
          onUpdateMood({ mood });
          onSectionHighlight?.('cycle-tracker');
          break;
        }
        case 'update_custom_section': {
          const sectionName = input.sectionName as string;
          const def = customSectionDefsRef.current.find(
            (s) => s.name.toLowerCase() === sectionName.toLowerCase()
          );
          if (def) {
            const existingData = data.customSections[def.id] || {};
            const updated: CustomSectionData = { ...existingData };

            if (def.type === 'text' && input.text) {
              const existing = existingData.text || '';
              updated.text = existing ? `${existing}\n${input.text}` : (input.text as string);
            } else if (def.type === 'checklist' && input.items) {
              const existingItems = existingData.checklist || [];
              const newItems = (input.items as string[]).map((text, i) => ({
                id: `ai-custom-${Date.now()}-${i}`,
                text,
                checked: false,
              }));
              updated.checklist = [...existingItems, ...newItems];
            } else if (def.type === 'rating' && input.rating != null) {
              updated.rating = input.rating as number;
            }

            onUpdateCustomSectionData(def.id, updated);
            onSectionHighlight?.(`custom-${def.id}`);
          }
          break;
        }
      }

      // Track pill for this message
      const pillInfo = TOOL_PILL_MAP[toolName];
      if (pillInfo) {
        const pill: ToolCallPill = {
          id: toolCallId,
          icon: pillInfo.icon,
          label: pillInfo.label(input),
        };
        setToolCallPills((prev) => {
          // Associate pills with the latest assistant message
          const key = 'pending';
          return { ...prev, [key]: [...(prev[key] || []), pill] };
        });
      }

    },
  });

  const isLoading = status === 'streaming' || status === 'submitted';

  // Move pending pills to their message once streaming completes
  useEffect(() => {
    if (status === 'ready' && toolCallPills['pending']?.length) {
      const lastAssistantMsg = [...messages].reverse().find((m) => m.role === 'assistant');
      if (lastAssistantMsg) {
        setToolCallPills((prev) => {
          const pending = prev['pending'] || [];
          const existing = prev[lastAssistantMsg.id] || [];
          const { pending: _, ...rest } = prev;
          return { ...rest, [lastAssistantMsg.id]: [...existing, ...pending] };
        });
      }
    }
  }, [status, messages, toolCallPills]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput('');
  };

  const handleCopy = async (text: string, id: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const quickPrompts = [
    { label: 'Reflect', prompt: 'Help me reflect on my day so far' },
    { label: 'Gratitude', prompt: 'Write 3 things I could be grateful for today' },
    { label: 'Done ideas', prompt: 'Based on a typical morning, suggest things I might have accomplished' },
  ];

  return (
    <div className="space-y-3">
      {/* Toggle Header */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between text-sm text-violet-400 hover:text-violet-300 transition-colors"
      >
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3" />
          {messages.length > 0 ? `${messages.length} messages` : 'Start a conversation'}
        </span>
        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
      </button>

      {isExpanded && (
        <>
          {/* Quick Prompts */}
          {messages.length === 0 && (
            <div className="flex flex-wrap gap-2">
              {quickPrompts.map((qp) => (
                <button
                  key={qp.label}
                  onClick={() => {
                    sendMessage({ text: qp.prompt });
                  }}
                  className="px-3 py-1.5 text-xs rounded-full bg-violet-500/15 text-violet-300 hover:bg-violet-500/25 transition-colors"
                >
                  {qp.label}
                </button>
              ))}
            </div>
          )}

          {/* Messages */}
          {messages.length > 0 && (
            <div className="max-h-64 overflow-y-auto space-y-3 pr-1">
              {messages.map((message) => {
                const text = getMessageText(message.parts || []);
                const isAssistant = message.role === 'assistant';
                const pills = toolCallPills[message.id] || [];

                return (
                  <div
                    key={message.id}
                    className={cn(
                      'rounded-xl px-3 py-2 text-sm',
                      isAssistant
                        ? 'bg-violet-500/10 text-violet-100'
                        : 'bg-white/5 text-violet-200 ml-8'
                    )}
                  >
                    {isAssistant && (
                      <div className="flex items-center gap-1 text-xs text-violet-400 mb-1">
                        <Sparkles className="w-3 h-3" />
                        Lumina
                      </div>
                    )}
                    {text && <p className="whitespace-pre-wrap leading-relaxed">{text}</p>}

                    {/* Tool call pills */}
                    {pills.length > 0 && (
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {pills.map((pill) => (
                          <span
                            key={pill.id}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-violet-500/20 text-violet-300 text-xs"
                          >
                            {pill.icon} {pill.label}
                          </span>
                        ))}
                      </div>
                    )}

                    {isAssistant && text && (
                      <div className="flex gap-1 mt-2 pt-2 border-t border-violet-500/20">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1 text-violet-400 hover:text-violet-300 hover:bg-violet-500/20"
                          onClick={() => handleCopy(text, message.id)}
                        >
                          {copiedId === message.id ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          Copy
                        </Button>
                      </div>
                    )}
                  </div>
                );
              })}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* Input */}
          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask Lumina anything..."
              disabled={isLoading}
              className="flex-1 px-3 py-2 text-sm rounded-xl bg-white/5 border border-violet-500/30 text-violet-100 focus:outline-none focus:ring-2 focus:ring-violet-500/50 placeholder:text-violet-400/50"
            />
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !input.trim()}
              className="h-9 w-9 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:from-violet-500 hover:to-purple-500 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-violet-400">
              <div className="flex gap-1">
                <span
                  className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
                  style={{ animationDelay: '0ms' }}
                />
                <span
                  className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
                  style={{ animationDelay: '150ms' }}
                />
                <span
                  className="w-1.5 h-1.5 bg-violet-400 rounded-full animate-bounce"
                  style={{ animationDelay: '300ms' }}
                />
              </div>
              Lumina is thinking...
            </div>
          )}
        </>
      )}
    </div>
  );
}
