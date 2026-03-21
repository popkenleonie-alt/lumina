import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';
import { subWeeks, subMonths, subYears, format } from 'date-fns';

export async function GET(req: NextRequest) {
  const dateParam = req.nextUrl.searchParams.get('date');
  if (!dateParam) {
    return NextResponse.json(null, { status: 400 });
  }

  const date = new Date(dateParam + 'T12:00:00');
  const lookbackDates = {
    oneWeek: format(subWeeks(date, 1), 'yyyy-MM-dd'),
    oneMonth: format(subMonths(date, 1), 'yyyy-MM-dd'),
    oneYear: format(subYears(date, 1), 'yyyy-MM-dd'),
  };

  const entries = await prisma.journalDay.findMany({
    where: {
      dateKey: { in: Object.values(lookbackDates) },
    },
    select: { dateKey: true, data: true },
  });

  const result: Record<string, { dateKey: string; worries: unknown[] }> = {};

  for (const [period, dateKey] of Object.entries(lookbackDates)) {
    const entry = entries.find((e) => e.dateKey === dateKey);
    const data = entry?.data as Record<string, unknown> | undefined;
    const worries = Array.isArray(data?.worries) ? data.worries : [];
    result[period] = { dateKey, worries };
  }

  return NextResponse.json(result);
}
