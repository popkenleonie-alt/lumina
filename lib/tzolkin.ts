/**
 * Mayan Tzolk'in calendar calculation.
 *
 * The Tzolk'in is a 260-day cycle: 13 numbers (1-13) × 20 day names.
 * Uses the GMT correlation constant (584283) to convert from Gregorian dates.
 */

const DAY_NAMES = [
  'Crocodile',
  'Wind',
  'Night',
  'Seed',
  'Serpent',
  'Death',
  'Deer',
  'Star',
  'Water',
  'Dog',
  'Monkey',
  'Road',
  'Reed',
  'Jaguar',
  'Eagle',
  'Owl',
  'Earth',
  'Flint',
  'Storm',
  'Sun',
] as const;

/** Focus keywords for each of the 20 day signs */
const DAY_FOCUS: string[] = [
  'nurturing · new beginnings · trust',        // Crocodile
  'communication · breath · flexibility',       // Wind
  'introspection · dreams · inner wisdom',      // Night
  'abundance · patience · planting ideas',      // Seed
  'vitality · transformation · shedding old',   // Serpent
  'letting go · acceptance · renewal',          // Death
  'healing · gentleness · grace',               // Deer
  'beauty · harmony · celebrating',             // Star
  'purification · flow · emotional depth',      // Water
  'loyalty · companionship · heart',            // Dog
  'play · creativity · lightheartedness',        // Monkey
  'purpose · service · steady progress',        // Road
  'authority · growth · standing tall',         // Reed
  'courage · intuition · the unknown',          // Jaguar
  'vision · ambition · rising above',           // Eagle
  'deep thought · memory · forgiveness',        // Owl
  'grounding · presence · synchronicity',       // Earth
  'clarity · truth · honest reflection',        // Flint
  'resilience · release · inner storms',        // Storm
  'wholeness · gratitude · radiance',           // Sun
];

/** GMT correlation constant — most widely accepted Mayan-to-Julian correlation */
const GMT_CORRELATION = 584283;

/** Convert a Gregorian date to Julian Day Number */
function toJulianDay(date: Date): number {
  const y = date.getFullYear();
  const m = date.getMonth() + 1;
  const d = date.getDate();

  const a = Math.floor((14 - m) / 12);
  const y1 = y + 4800 - a;
  const m1 = m + 12 * a - 3;

  return (
    d +
    Math.floor((153 * m1 + 2) / 5) +
    365 * y1 +
    Math.floor(y1 / 4) -
    Math.floor(y1 / 100) +
    Math.floor(y1 / 400) -
    32045
  );
}

export interface TzolkinDay {
  /** Number 1-13 */
  number: number;
  /** Day name (e.g. "Crocodile", "Sun") */
  name: string;
  /** Focus keywords for the day */
  focus: string;
  /** Full display string (e.g. "4 Sun") */
  display: string;
  /** Day number in the 260-day cycle (0-259) */
  dayInCycle: number;
}

/** Get the Tzolk'in day for a given date */
export function getTzolkinDay(date: Date): TzolkinDay {
  const jdn = toJulianDay(date);
  const daysSinceEpoch = jdn - GMT_CORRELATION;

  // Tzolk'in number cycles 1-13
  // Adjust: the correlation puts day 0 at 4 Ajaw
  const tzolkinNumber = (((daysSinceEpoch + 3) % 13) + 13) % 13 + 1;

  // Tzolk'in day name cycles through 20 names
  // Day 0 of the long count = 4 Ajaw, so name index offset is 19 (Ajaw)
  const nameIndex = (((daysSinceEpoch + 19) % 20) + 20) % 20;

  const name = DAY_NAMES[nameIndex];
  const focus = DAY_FOCUS[nameIndex];
  const dayInCycle = ((daysSinceEpoch % 260) + 260) % 260;

  return {
    number: tzolkinNumber,
    name,
    focus,
    display: `${tzolkinNumber} ${name}`,
    dayInCycle,
  };
}
