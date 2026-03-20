import { format, addDays, subDays, startOfWeek, isSameDay, isToday } from 'date-fns';

export function formatDateKey(date: Date): string {
  return format(date, 'yyyy-MM-dd');
}

export function getWeekDays(currentDate: Date): Date[] {
  const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Monday start
  return Array.from({ length: 7 }, (_, i) => addDays(start, i));
}

export function getDayName(date: Date): string {
  return format(date, 'EEE');
}

export function getDayNumber(date: Date): number {
  return date.getDate();
}

export function isSameDayCheck(date1: Date, date2: Date): boolean {
  return isSameDay(date1, date2);
}

export function isTodayCheck(date: Date): boolean {
  return isToday(date);
}

export function getNextDay(date: Date): Date {
  return addDays(date, 1);
}

export function getPreviousDay(date: Date): Date {
  return subDays(date, 1);
}

export function formatDisplayDate(date: Date): string {
  return format(date, 'EEEE, MMMM d');
}
