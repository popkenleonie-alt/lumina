import { generateObject } from 'ai';
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

  const journalContext = buildJournalContext(dayData, customSectionDefinitions);

  const { object } = await generateObject({
    model: anthropic('claude-haiku-4-5-20251001'),
    schema: z.object({
      summary: z.string().describe('A short, warm day summary (3-5 sentences). Highlight positive moments, acknowledge efforts, and end with a gentle, encouraging note. Be specific — reference actual things they wrote. If the journal is mostly empty, give a kind, brief note about taking time for themselves. Write in a flowing, personal tone as if talking to a friend.'),
      stickers: z.array(z.string()).describe('An array of 1-4 sticker IDs earned today, based on the entries. Only award stickers clearly supported by what they wrote.'),
    }),
    system: `You are Lumina, a warm and supportive journal companion. The user has finished their day and wants a brief summary/reflection.

Available sticker IDs:
${stickerList}`,
    prompt: `Here is the journal for ${dateKey}:\n\n${journalContext}`,
    abortSignal: req.signal,
  });

  const validStickers = (object.stickers ?? []).filter((id: string) => stickerIds.has(id));
  return Response.json({
    summary: object.summary,
    stickers: validStickers.slice(0, 4),
  });
}

function buildJournalContext(
  data: DayData,
  customSectionDefinitions: CustomSectionDefinition[],
): string {
  const parts: string[] = [];

  if (data.dreamJournal) {
    parts.push(`Dream Journal: ${data.dreamJournal}`);
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
