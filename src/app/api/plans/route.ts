import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET() {
  try {
    const plans = await prisma.plan.findMany({ orderBy: { price: 'asc' } });
    return NextResponse.json({ plans });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to fetch plans.' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { name, price, features } = await req.json();
  let featuresObj: Record<string, unknown> = {};
  if (features) {
    try {
      featuresObj = typeof features === 'string' ? JSON.parse(features) : features;
    } catch {
      return NextResponse.json({ error: 'Invalid features format' }, { status: 400 });
    }
  }
  
  const plan = await prisma.plan.create({
    data: { name, price: Number(price), features: featuresObj as any },
  });
  return NextResponse.json({ plan });
}

export async function PUT(req: NextRequest) {
  const { id, name, price, features } = await req.json();
  let featuresObj: Record<string, unknown> = {};
  if (features) {
    try {
      featuresObj = typeof features === 'string' ? JSON.parse(features) : features;
    } catch {
      return NextResponse.json({ error: 'Invalid features format' }, { status: 400 });
    }
  }

  const updatedPlan = await prisma.plan.update({
    where: { id: Number(id) },
    data: { 
      name, 
      price: price ? Number(price) : undefined,
      features: featuresObj as any
    },
  });
  return NextResponse.json({ plan: updatedPlan });
} 