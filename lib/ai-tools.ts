import { jsonSchema } from 'ai';

export const VALID_MOODS = ['😊', '😐', '😢', '😤', '🥱', '🤩', '😌', '🥺'] as const;

export const journalTools = {
  update_food_journal: {
    description:
      'Add a food journal entry. Use this when the user mentions eating or drinking something. A timestamp is added automatically.',
    inputSchema: jsonSchema({
      type: 'object' as const,
      properties: {
        what: { type: 'string' as const, description: 'What the user ate or drank' },
        why: { type: 'string' as const, description: 'Why they ate (hungry, bored, stressed, social, craving, etc.). Leave empty if not mentioned.' },
        feelingBefore: { type: 'string' as const, description: 'How they felt before eating. Leave empty if not mentioned.' },
        feelingAfter: { type: 'string' as const, description: 'How they felt after eating. Leave empty if not mentioned.' },
      },
      required: ['what'],
    }),
  },

  add_done_items: {
    description:
      'Add items to the Done List. Use when the user mentions accomplishments, activities, or tasks they completed.',
    inputSchema: jsonSchema({
      type: 'object' as const,
      properties: {
        items: {
          type: 'array' as const,
          items: { type: 'string' as const },
          description: 'List of accomplishment/task descriptions to add',
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
