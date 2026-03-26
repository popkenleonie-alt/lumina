import { generateText } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const anthropic = createAnthropic({
  baseURL: process.env.LUMINA_ANTHROPIC_BASE_URL,
});

export const maxDuration = 30;

export async function POST(req: NextRequest) {
  const { dateKeys }: { dateKeys: string[] } = await req.json();

  if (!dateKeys?.length) {
    return NextResponse.json({ error: 'Missing dateKeys' }, { status: 400 });
  }

  // Fetch all days in one query
  const entries = await prisma.journalDay.findMany({
    where: { dateKey: { in: dateKeys } },
  });

  const weekData: Record<string, unknown> = {};
  for (const e of entries) {
    weekData[e.dateKey] = e.data;
  }

  const prompt = `You are Lumina, a warm journal companion. Below is a user's journal data for one week. For each section, write ONE short sentence (max 10-12 words) as a personal highlight. Be specific — reference actual entries. No fluff. If a section has no data, write "—".

Respond as JSON with this exact shape (no markdown fences):
{
  "intentions": "...",
  "dreams": "...",
  "done-list": "...",
  "sports": "...",
  "cycle": "...",
  "food": "...",
  "beliefs": "...",
  "worries": "...",
  "reflections": "..."
}

Week data:
${JSON.stringify(weekData, null, 2)}`;

  const { text } = await generateText({
    model: anthropic('claude-haiku-4-5-20251001'),
    prompt,
    abortSignal: req.signal,
  });

  try {
    // Strip potential markdown fences
    const cleaned = text.replace(/```json?\n?/g, '').replace(/```/g, '').trim();
    const summaries = JSON.parse(cleaned);
    return NextResponse.json(summaries);
  } catch {
    return NextResponse.json({ error: 'Failed to parse AI response' }, { status: 500 });
  }
}
