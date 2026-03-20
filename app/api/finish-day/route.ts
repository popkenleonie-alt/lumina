import { generateText, Output } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { z } from 'zod';
import { STICKERS } from '@/lib/stickers';
import type { DayData, CustomSectionDefinition } from '@/hooks/useJournalStore';

const anthropic = createAnthropic({
  baseURL: process.env.LUMINA_ANTHROPIC_BASE_URL,
});

export const maxDuration = 30;

const stickerIds = new Set(STICKERS.map((s) => s.id));
const stickerList = STICKERS.map((s) => `"${s.id}" — ${s.label}`).join('\n');

export async function POST(req: Request) {
  const {
    dayData,
    customSectionDefinitions,
    dateKey,
  }: {
    dayData: DayData;
    customSectionDefinitions: CustomSectionDefinition[];
    dateKey: string;
  } = await req.json();

  if (!dayData) {
    return Response.json({ summary: 'No journal data for today.', stickers: [] });
  }

  const journalContext = buildJournalContext(dayData, customSectionDefinitions ?? []);

  try {
    const result = await generateText({
      model: anthropic('claude-haiku-4-5-20251001'),
      output: Output.object({
        schema: z.object({
          summary: z.string().describe('A concise, warm day summary (2-3 sentences). Reference the day\'s intention if one was set and reflect on how the day aligned with it. Highlight one or two specific moments from entries. End with a brief encouraging note. If the journal is mostly empty, give a kind one-liner. Write in a personal tone as if talking to a friend.'),
          stickers: z.array(z.string()).describe('An array of 1-4 sticker IDs earned today, based on the entries. Only award stickers clearly supported by what they wrote.'),
        }),
      }),
      system: `You are Lumina, a warm and supportive journal companion. The user has finished their day and wants a brief summary/reflection.

Available sticker IDs:
${stickerList}`,
      prompt: `Here is the journal for ${dateKey}:\n\n${journalContext}`,
      abortSignal: req.signal,
    });

    const object = result.object;
    const validStickers = (object?.stickers ?? []).filter((id: string) => stickerIds.has(id));
    return Response.json({
      summary: object?.summary ?? '',
      stickers: validStickers.slice(0, 4),
    });
  } catch (error) {
    console.error('finish-day AI error:', error);
    return Response.json({ error: 'Failed to generate summary' }, { status: 500 });
  }
}

function buildJournalContext(
  data: DayData,
  customSectionDefinitions: CustomSectionDefinition[],
): string {
  const parts: string[] = [];

  if (data.intention) {
    parts.push(`Today's intention: ${data.intention}`);
  }

  if (data.doneList?.length > 0) {
    parts.push(
      `Done today: ${data.doneList.map((i) => i.text).join(', ')}`,
    );
  }

  if (data.cycleTracker?.mood) {
    parts.push(`Mood: ${data.cycleTracker.mood}`);
  }

  if (data.beliefs?.length > 0) {
    const beliefTexts = data.beliefs
      .map((b) => {
        const lines = [`Belief: ${b.belief}`];
        if (b.challenge) lines.push(`Challenge: ${b.challenge}`);
        if (b.reframe) lines.push(`Reframe: ${b.reframe}`);
        return lines.join('\n');
      })
      .join('\n---\n');
    parts.push(`Belief work:\n${beliefTexts}`);
  }

  if (data.foodEntries?.length > 0) {
    const foodTexts = data.foodEntries
      .map((e) => {
        const time = new Date(e.timestamp).toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        });
        const lines = [`${time} — ${e.what}`];
        if (e.why) lines.push(`Why: ${e.why}`);
        if (e.feelingBefore) lines.push(`Feeling before: ${e.feelingBefore}`);
        if (e.feelingAfter) lines.push(`Feeling after: ${e.feelingAfter}`);
        return lines.join('\n');
      })
      .join('\n---\n');
    parts.push(`Food journal:\n${foodTexts}`);
  }

  if (data.notes) {
    parts.push(`Additional thoughts: ${data.notes}`);
  }

  for (const def of customSectionDefinitions) {
    const sectionData = data.customSections[def.id];
    if (!sectionData) continue;
    if (def.type === 'text' && sectionData.text) {
      parts.push(`${def.name}: ${sectionData.text}`);
    } else if (def.type === 'checklist' && sectionData.checklist?.length) {
      const items = sectionData.checklist
        .map((i) => `${i.checked ? '✓' : '○'} ${i.text}`)
        .join(', ');
      parts.push(`${def.name}: ${items}`);
    } else if (def.type === 'rating' && sectionData.rating) {
      parts.push(`${def.name}: ${sectionData.rating}/5`);
    }
  }

  return parts.length > 0
    ? parts.join('\n\n')
    : 'The journal is empty for this day.';
}
