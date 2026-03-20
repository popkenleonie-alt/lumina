import { prisma } from '@/lib/db';
import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const dateKey = req.nextUrl.searchParams.get('dateKey');
  if (!dateKey) {
    return NextResponse.json(null, { status: 400 });
  }

  const entry = await prisma.journalDay.findUnique({
    where: { dateKey },
  });

  return NextResponse.json(entry?.data ?? null);
}

export async function PUT(req: NextRequest) {
  const { dateKey, data } = await req.json();
  if (!dateKey || !data) {
    return NextResponse.json({ error: 'Missing dateKey or data' }, { status: 400 });
  }

  await prisma.journalDay.upsert({
    where: { dateKey },
    create: { dateKey, data },
    update: { data },
  });

  return NextResponse.json({ ok: true });
}
