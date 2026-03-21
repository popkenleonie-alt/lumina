import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
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
      system: `You are Lumina, a warm and supportive journal companion. The user has finished their day and wants a brief summary/reflection and meaningful badges.

## About the user
- Edo is her boyfriend.
- Netlight is her workplace.

Available sticker IDs:
${stickerList}

## Badge Assignment Rules

Use these badge categories: Discipline, Courage, Growth, Reflection, Connection, Well-being, Creativity.

Each badge must:
- Belong to one category
- Use a consistent badge type (e.g., "Showed Up Anyway", "Faced Discomfort", "Insight Moment", "Urge Surfed", etc.)
- Include an intensity level from 1 to 3:
  - Level 1 = small but intentional
  - Level 2 = clear effort or significance
  - Level 3 = exceptional or emotionally meaningful

Rules:
- Assign 0–3 badges maximum. It is completely acceptable to assign ZERO badges.
- Only reward actions that are effortful, meaningful, and aligned with growth or values.
- Do NOT reward routine or trivial actions unless they show unusual discipline or change.

Process:
1. Identify 3–5 candidate moments from the journal.
2. Score each moment (1–10) for meaningfulness.
3. Only keep moments scoring 7 or higher.
4. From those, assign up to 3 badges.

Before finalizing each badge, reflect: "Would this make the user feel genuinely proud in a week?" If not, discard it.

### Special Rule: Recognizing Self-Control Around Eating
Pay special attention to moments where the user felt an urge to eat (especially emotionally or out of habit), paused or became aware of the urge, and chose not to eat, delay eating, or eat more intentionally.
Badge Type: "Urge Surfed" (Category: Discipline, or Reflection if awareness is central).
Only assign if there is clear evidence of an internal struggle, the user made a conscious decision, and it reflects self-control (not avoidance or guilt).
Do NOT assign if: the user simply didn't mention food, the behavior seems restrictive/unhealthy, or there is no clear resisted impulse.
Higher intensity (Level 2–3) for strong urges, explicit reflection, or progress compared to past behavior.

Respond with ONLY a JSON object (no markdown, no code fences) with this shape:
{"summary": "...", "stickers": ["sticker-id-1", ...], "badges": [{"name": "...", "category": "...", "intensity": 1, "explanation": "...", "whyItMatters": "..."}]}

- summary: A concise, warm day summary (2-3 sentences). Reference the day's intention if one was set and reflect on how the day aligned with it. Highlight one or two specific moments from entries. End with a brief encouraging note. If the journal is mostly empty, give a kind one-liner. Write in a personal tone as if talking to a friend.
- stickers: An array of 1-4 sticker IDs earned today, based on the entries. Only award stickers clearly supported by what they wrote.
- badges: An array of 0-3 structured badges as described above. Can be empty.`,
      prompt: `Here is the journal for ${dateKey}:\n\n${journalContext}`,
      abortSignal: req.signal,
    });

    const cleaned = result.text.replace(/^```(?:json)?\s*\n?/m, '').replace(/\n?```\s*$/m, '').trim();
    const object = JSON.parse(cleaned);
    const validStickers = (object?.stickers ?? []).filter((id: string) => stickerIds.has(id));
    const badges = (object?.badges ?? []).slice(0, 3);
    return Response.json({
      summary: object?.summary ?? '',
      stickers: validStickers.slice(0, 4),
      badges,
    });
  } catch (error: unknown) {
    const err = error as { message?: string; statusCode?: number; url?: string; cause?: unknown };
    console.error('finish-day AI error:', err.message, 'status:', err.statusCode, 'url:', err.url, 'cause:', err.cause);
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

  if (data.dreamJournal) {
    parts.push(`Dream journal: ${data.dreamJournal}`);
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

  if (data.worries?.length > 0) {
    const worryTexts = data.worries
      .map((w) => {
        const lines = [`Worry: ${w.worry}`];
        if (w.worstCase) lines.push(`Worst case: ${w.worstCase}`);
        if (w.action) lines.push(`Action: ${w.action}`);
        return lines.join('\n');
      })
      .join('\n---\n');
    parts.push(`Worries:\n${worryTexts}`);
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
