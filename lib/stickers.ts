export interface Sticker {
  id: string;
  label: string;
  url: string;
}

// Google Noto Emoji — Apache 2.0 license, hosted on fonts.gstatic.com
const notoUrl = (codepoint: string) =>
  `https://fonts.gstatic.com/s/e/notoemoji/latest/${codepoint}/512.webp`;

export const STICKERS: Sticker[] = [
  { id: 'workout', label: 'Workout', url: notoUrl('1f4aa') },
  { id: 'meditation', label: 'Meditation', url: notoUrl('1f9d8') },
  { id: 'reading', label: 'Reading', url: notoUrl('1f4da') },
  { id: 'hydration', label: 'Hydration', url: notoUrl('1f4a7') },
  { id: 'nature', label: 'Nature', url: notoUrl('1f33f') },
  { id: 'self-care', label: 'Self-care', url: notoUrl('2728') },
  { id: 'goal', label: 'Goal hit', url: notoUrl('1f3af') },
  { id: 'good-sleep', label: 'Good sleep', url: notoUrl('1f6cc') },
  { id: 'cardio', label: 'Cardio', url: notoUrl('1f3c3') },
  { id: 'healthy-eating', label: 'Healthy eating', url: notoUrl('1f34e') },
  { id: 'creative', label: 'Creative', url: notoUrl('1f3a8') },
  { id: 'music', label: 'Music', url: notoUrl('1f3b5') },
  { id: 'star', label: 'Star day', url: notoUrl('2b50') },
  { id: 'fire', label: 'On fire', url: notoUrl('1f525') },
  { id: 'mindful', label: 'Mindful', url: notoUrl('1f9e0') },
  { id: 'social', label: 'Social', url: notoUrl('1f91d') },
  { id: 'cooking', label: 'Cooking', url: notoUrl('1f373') },
  { id: 'journaling', label: 'Journaling', url: notoUrl('1f4dd') },
  { id: 'growth', label: 'Growth', url: notoUrl('1f331') },
  { id: 'kindness', label: 'Kindness', url: notoUrl('1f49c') },
];

export const STICKER_MAP = Object.fromEntries(
  STICKERS.map((s) => [s.id, s]),
) as Record<string, Sticker>;
