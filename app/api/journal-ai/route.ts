import { consumeStream, convertToModelMessages, streamText, UIMessage } from 'ai';

export const maxDuration = 30;

export async function POST(req: Request) {
  const { messages, context }: { messages: UIMessage[]; context: string } = await req.json();

  const systemPrompt = `You are Lumina, a friendly and supportive AI journal companion. You help users reflect on their day, set intentions, and maintain positive habits.

Current journal context for today:
${context}

Your capabilities:
- Help users write journal entries, reflections, and gratitude lists
- Suggest things to add to their Done List based on their achievements
- Provide gentle reminders and encouragement
- Offer thoughtful prompts for dream journaling
- Help track patterns in mood and habits

When asked to create content for the journal, format your response clearly so the user can easily copy it. Be warm, supportive, and concise. Use short paragraphs.`;

  const result = streamText({
    model: 'openai/gpt-4o-mini',
    system: systemPrompt,
    messages: await convertToModelMessages(messages),
    abortSignal: req.signal,
  });

  return result.toUIMessageStreamResponse({
    consumeSseStream: consumeStream,
  });
}
