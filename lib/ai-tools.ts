import { jsonSchema } from 'ai';

export const VALID_MOODS = ['😊', '😐', '😢', '😤', '🥱', '🤩', '😌', '🥺'] as const;

export const journalTools = {
  update_food_journal: {
    description:
      'Add a food journal entry. Use this when the user mentions eating or drinking something. Infer a reasonable timestamp from context (e.g. "breakfast" → morning, "lunch" → midday). Use ISO 8601 format.',
    inputSchema: jsonSchema({
      type: 'object' as const,
      properties: {
        what: { type: 'string' as const, description: 'What the user ate or drank' },
        why: { type: 'string' as const, description: 'Why they ate (hungry, bored, stressed, social, craving, etc.). Leave empty if not mentioned.' },
        feelingBefore: { type: 'string' as const, description: 'How they felt before eating. Leave empty if not mentioned.' },
        feelingAfter: { type: 'string' as const, description: 'How they felt after eating. Leave empty if not mentioned.' },
        timestamp: { type: 'string' as const, description: 'ISO 8601 timestamp for when this happened. Infer from context: "breakfast" → ~08:00, "lunch" → ~12:30, "dinner" → ~19:00, "snack this afternoon" → ~15:00. Use current time only if no time context is given.' },
      },
      required: ['what'],
    }),
  },

  add_done_items: {
    description:
      'Add items to the Done List. Use when the user mentions accomplishments, activities, or tasks they completed. Infer reasonable timestamps from context.',
    inputSchema: jsonSchema({
      type: 'object' as const,
      properties: {
        items: {
          type: 'array' as const,
          items: {
            type: 'object' as const,
            properties: {
              text: { type: 'string' as const, description: 'The accomplishment/task description' },
              timestamp: { type: 'string' as const, description: 'ISO 8601 timestamp for when this was done. Infer from context (e.g. "this morning" → ~09:00, "after lunch" → ~13:30). Use current time if no context.' },
            },
            required: ['text'],
          },
          description: 'List of accomplishments/tasks to add, each with an optional inferred timestamp',
        },
      },
      required: ['items'],
    }),
  },

  update_dream_journal: {
    description:
      'Update the dream journal. Use when the user describes a dream or wants to record dream-related content.',
    inputSchema: jsonSchema({
      type: 'object' as const,
      properties: {
        text: { type: 'string' as const, description: 'The dream journal text to add' },
      },
      required: ['text'],
    }),
  },


  update_mood: {
    description: `Set the user's mood. Available moods: 😊 (happy), 😐 (neutral), 😢 (sad), 😤 (angry/frustrated), 🥱 (tired), 🤩 (excited), 😌 (calm/peaceful), 🥺 (vulnerable/emotional). Use when the user expresses how they feel.`,
    inputSchema: jsonSchema({
      type: 'object' as const,
      properties: {
        mood: {
          type: 'string' as const,
          enum: [...VALID_MOODS],
          description: 'The mood emoji to set',
        },
      },
      required: ['mood'],
    }),
  },

  add_worries: {
    description:
      'Add worries to the Worries section. Use when the user expresses worries, anxieties, or concerns. Help them process by filling in worst case and action plan if possible.',
    inputSchema: jsonSchema({
      type: 'object' as const,
      properties: {
        worries: {
          type: 'array' as const,
          items: {
            type: 'object' as const,
            properties: {
              worry: { type: 'string' as const, description: 'The worry or concern' },
              worstCase: { type: 'string' as const, description: 'What is the worst that could happen? Leave empty if not discussed.' },
              action: { type: 'string' as const, description: 'What can be done about it? Leave empty if not discussed.' },
            },
            required: ['worry'],
          },
          description: 'List of worries to add',
        },
      },
      required: ['worries'],
    }),
  },

  add_beliefs: {
    description:
      'Add belief entries to the Beliefs section. Use when the user mentions limiting beliefs, negative self-talk, or thought patterns they want to examine.',
    inputSchema: jsonSchema({
      type: 'object' as const,
      properties: {
        beliefs: {
          type: 'array' as const,
          items: {
            type: 'object' as const,
            properties: {
              belief: { type: 'string' as const, description: 'The belief or thought pattern' },
              challenge: { type: 'string' as const, description: 'Why this belief might not be true. Leave empty if not discussed.' },
              reframe: { type: 'string' as const, description: 'A healthier way to think about it. Leave empty if not discussed.' },
            },
            required: ['belief'],
          },
          description: 'List of beliefs to examine',
        },
      },
      required: ['beliefs'],
    }),
  },

  update_intention: {
    description:
      'Set or update the daily intention. Use when the user expresses what they want to focus on today, their goal, or main priority.',
    inputSchema: jsonSchema({
      type: 'object' as const,
      properties: {
        intention: { type: 'string' as const, description: 'The daily intention or focus' },
      },
      required: ['intention'],
    }),
  },

  update_notes: {
    description:
      'Add to the Additional Thoughts section. Use when the user shares reflections, observations, or thoughts that don\'t fit other sections.',
    inputSchema: jsonSchema({
      type: 'object' as const,
      properties: {
        text: { type: 'string' as const, description: 'The text to add to additional thoughts' },
      },
      required: ['text'],
    }),
  },

  update_custom_section: {
    description:
      'Update a user-defined custom section. Only use when the content clearly matches a custom section name. The available custom sections will be listed in the system prompt.',
    inputSchema: jsonSchema({
      type: 'object' as const,
      properties: {
        sectionName: { type: 'string' as const, description: 'The name of the custom section to update' },
        text: { type: 'string' as const, description: 'Text content (for text-type sections)' },
        items: {
          type: 'array' as const,
          items: { type: 'string' as const },
          description: 'Checklist items (for checklist-type sections)',
        },
        rating: { type: 'number' as const, minimum: 1, maximum: 5, description: 'Rating value 1-5 (for rating-type sections)' },
      },
      required: ['sectionName'],
    }),
  },
};
