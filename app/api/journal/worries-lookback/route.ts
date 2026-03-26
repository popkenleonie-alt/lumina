import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { subWeeks, subMonths, subYears, format } from 'date-fns';

export async function GET(req: NextRequest) {
  const dateParam = req.nextUrl.searchParams.get('date');
  if (!dateParam) {
    return NextResponse.json(null, { status: 400 });
  }

  const date = new Date(dateParam + 'T12:00:00');
  const today = format(date, 'yyyy-MM-dd');
  const ranges = {
    oneWeek: format(subWeeks(date, 1), 'yyyy-MM-dd'),
    oneMonth: format(subMonths(date, 1), 'yyyy-MM-dd'),
    oneYear: format(subYears(date, 1), 'yyyy-MM-dd'),
  };

  // Fetch all entries from the longest range (1 year ago to yesterday)
  const entries = await prisma.journalDay.findMany({
    where: {
      dateKey: { gte: ranges.oneYear, lt: today },
    },
    select: { dateKey: true, data: true },
    orderBy: { dateKey: 'desc' },
  });

  const result: Record<string, { dateKey: string; worries: unknown[] }[]> = {
    oneWeek: [],
    oneMonth: [],
    oneYear: [],
  };

  for (const entry of entries) {
    const data = entry.data as Record<string, unknown> | undefined;
    const worries = Array.isArray(data?.worries) ? data.worries : [];
    if (worries.length === 0) continue;

    const item = { dateKey: entry.dateKey, worries };

    if (entry.dateKey >= ranges.oneWeek) {
      result.oneWeek.push(item);
    }
    if (entry.dateKey >= ranges.oneMonth) {
      result.oneMonth.push(item);
    }
    result.oneYear.push(item);
  }

  return NextResponse.json(result);
}
