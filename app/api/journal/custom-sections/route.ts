import { prisma } from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
  const row = await prisma.customSectionDefinitions.findUnique({
    where: { id: 'singleton' },
  });

  return NextResponse.json(row?.definitions ?? []);
}

export async function PUT(req: Request) {
  const definitions = await req.json();

  await prisma.customSectionDefinitions.upsert({
    where: { id: 'singleton' },
    create: { definitions },
    update: { definitions },
  });

  return NextResponse.json({ ok: true });
}
