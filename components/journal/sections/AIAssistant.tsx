'use client';

import { useState, useRef, useEffect } from 'react';
import { useChat } from '@ai-sdk/react';
import { DefaultChatTransport } from 'ai';
import { Send, Sparkles, Copy, Check, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import type { DayData } from '@/hooks/useJournalStore';

interface AIAssistantProps {
  journalData: DayData;
  onInsertToDream?: (text: string) => void;
  onInsertToDone?: (text: string) => void;
}

function getMessageText(parts: Array<{ type: string; text?: string }>): string {
  return parts
    .filter((p): p is { type: 'text'; text: string } => p.type === 'text' && !!p.text)
    .map((p) => p.text)
    .join('');
}

export function AIAssistant({ journalData, onInsertToDream, onInsertToDone }: AIAssistantProps) {
  const [input, setInput] = useState('');
  const [isExpanded, setIsExpanded] = useState(true);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Build context from journal data
  const context = `
Dream Journal: ${journalData.dreamJournal || '(empty)'}
Done List: ${journalData.doneList.map((i) => `${i.checked ? '✓' : '○'} ${i.text}`).join(', ') || '(empty)'}
Badges earned: ${journalData.badges.join(', ') || '(none)'}
Mood: ${journalData.cycleTracker.mood || 'Not set'}
`;

  const { messages, sendMessage, status } = useChat({
    transport: new DefaultChatTransport({
      api: '/api/journal-ai',
      body: { context },
    }),
  });

  const isLoading = status === 'streaming' || status === 'submitted';

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
        className="w-full flex items-center justify-between text-sm text-muted-foreground hover:text-foreground transition-colors"
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
                  className="px-3 py-1.5 text-xs rounded-full bg-gradient-to-r from-pink-100 to-purple-100 text-purple-700 hover:from-pink-200 hover:to-purple-200 transition-colors"
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

                return (
                  <div
                    key={message.id}
                    className={cn(
                      'rounded-xl px-3 py-2 text-sm',
                      isAssistant
                        ? 'bg-gradient-to-br from-purple-50 to-pink-50 text-foreground'
                        : 'bg-muted/50 ml-8'
                    )}
                  >
                    {isAssistant && (
                      <div className="flex items-center gap-1 text-xs text-purple-500 mb-1">
                        <Sparkles className="w-3 h-3" />
                        Lumina
                      </div>
                    )}
                    <p className="whitespace-pre-wrap leading-relaxed">{text}</p>
                    {isAssistant && text && (
                      <div className="flex gap-1 mt-2 pt-2 border-t border-purple-100/50">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs gap-1 text-purple-600 hover:text-purple-700 hover:bg-purple-100/50"
                          onClick={() => handleCopy(text, message.id)}
                        >
                          {copiedId === message.id ? (
                            <Check className="w-3 h-3" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                          Copy
                        </Button>
                        {onInsertToDream && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-100/50"
                            onClick={() => onInsertToDream(text)}
                          >
                            + Dream
                          </Button>
                        )}
                        {onInsertToDone && (
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-7 text-xs text-purple-600 hover:text-purple-700 hover:bg-purple-100/50"
                            onClick={() => onInsertToDone(text)}
                          >
                            + Done
                          </Button>
                        )}
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
              className="flex-1 px-3 py-2 text-sm rounded-xl bg-white/50 border border-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-300/50 placeholder:text-muted-foreground/60"
            />
            <Button
              type="submit"
              size="sm"
              disabled={isLoading || !input.trim()}
              className="h-9 w-9 rounded-xl bg-gradient-to-r from-pink-400 to-purple-400 hover:from-pink-500 hover:to-purple-500 text-white"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>

          {isLoading && (
            <div className="flex items-center gap-2 text-xs text-purple-400">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
              Lumina is thinking...
            </div>
          )}
        </>
      )}
    </div>
  );
}
