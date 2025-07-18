import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const featureMap: Record<string, string> = {
  ai_agent: 'Self-Serve',
  file_upload: 'Self-Serve',
  live_consultation: 'Expert',
};

export async function POST(req: NextRequest) {
  const { userId, feature } = await req.json();
  if (!userId || !feature) return NextResponse.json({ error: 'userId and feature required' }, { status: 400 });
  const user = await prisma.user.findUnique({ where: { id: Number(userId) }, include: { plan: true } });
  if (!user || !user.plan) return NextResponse.json({ allowed: false, upgradePlan: featureMap[feature] || 'Self-Serve' });
  const planFeatures = user.plan.features as any;
  const allowed = planFeatures[feature] === true || planFeatures[feature] > 0;
  return NextResponse.json({ allowed, upgradePlan: allowed ? undefined : featureMap[feature] });
} 