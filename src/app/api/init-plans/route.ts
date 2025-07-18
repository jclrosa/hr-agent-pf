import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  const plansData = [
    {
      name: 'Free',
      price: 0,
      features: { templates: 3, ai_agent: false, file_upload: false, live_consultation: false },
    },
    {
      name: 'Self-Serve',
      price: 9900,
      features: { templates: 20, ai_agent: true, file_upload: true, live_consultation: false },
    },
    {
      name: 'Expert',
      price: 200000,
      features: { templates: 20, ai_agent: true, file_upload: true, live_consultation: true, consultation_hours: 5 },
    },
    {
      name: 'Premium',
      price: 500000,
      features: { templates: 20, ai_agent: true, file_upload: true, live_consultation: true, consultation_hours: -1, custom_implementation: true },
    },
  ];
  for (const plan of plansData) {
    const existing = await prisma.plan.findUnique({ where: { name: plan.name } });
    if (!existing) {
      await prisma.plan.create({ data: { ...plan } });
    }
  }
  return NextResponse.json({ message: 'Plans initialized successfully' });
} 