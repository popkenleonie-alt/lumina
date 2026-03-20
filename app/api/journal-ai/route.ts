import { consumeStream, convertToModelMessages, streamText, UIMessage } from 'ai';
import { createAnthropic } from '@ai-sdk/anthropic';
import { journalTools } from '@/lib/ai-tools';

const anthropic = createAnthropic({
  baseURL: process.env.LUMINA_ANTHROPIC_BASE_URL,
});

export const maxDuration = 30;

interface CustomSectionInfo {
  name: string;
  type: 'text' | 'checklist' | 'photo' | 'rating';
}

export async function POST(req: Request) {
  const {
    messages,
    context,
    customSections,
    currentTime,
  }: {
    messages: UIMessage[];
    context: string;
    customSections?: CustomSectionInfo[];
    currentTime?: string;
  } = await req.json();

  const customSectionsPrompt = customSections?.length
    ? `\nCustom sections available:\n${customSections.map((s) => `- "${s.name}" (type: ${s.type})`).join('\n')}`
    : '\nNo custom sections defined.';

  const systemPrompt = `You are Lumina, a friendly and supportive AI journal companion. You help users reflect on their day, set intentions, and maintain positive habits.

Current time: ${currentTime || new Date().toLocaleTimeString()}

Current journal context for today:
${context}
${customSectionsPrompt}

## Tool Usage Instructions
You have tools to directly update the user's journal. Use them proactively when the user shares information that belongs in a journal section. You can call multiple tools in one response.

**When to use tools:**
- User mentions food/drinks → use update_food_journal (infer meal from current time: before 11am = morning, 11am-3pm = noon, 3pm-9pm = evening, or snacks for snack items anytime)
- User mentions accomplishments/activities → use add_done_items AND toggle relevant badges
- User describes a dream → use update_dream_journal
- User expresses feelings → use update_mood
- User shares content matching a custom section → use update_custom_section

**When NOT to use tools:**
- User is asking a question or wants to chat
- User asks you to write/suggest content (respond with text, let them decide)
- Content is ambiguous — ask for clarification instead

Always respond with a brief, warm message alongside tool calls to acknowledge what you did. Be concise. Use short paragraphs.`;

  const result = streamText({
    model: anthropic('claude-haiku-4-5-20251001'),
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    tools: journalTools,
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse({
    consumeSseStream: consumeStream,
  });
}
