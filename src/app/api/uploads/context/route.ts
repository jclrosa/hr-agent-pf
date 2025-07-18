import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { id: Number(userId) }, include: { plan: true } });
  if (!user || !user.plan || !(user.plan.features as any)?.file_upload) {
    return NextResponse.json({ error: 'File upload requires Self-Serve plan or higher' }, { status: 403 });
  }
  const files = await prisma.uploadedFile.findMany({
    where: { userId: Number(userId) }
  });
  const context = files
    .filter(f => f.content)
    .map(f => `--- ${f.filename} ---\n${f.content}\n`)
    .join('\n');
  return NextResponse.json({ context });
} 