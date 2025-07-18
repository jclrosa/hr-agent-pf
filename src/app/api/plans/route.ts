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
  try {
    const body = await req.json();
    const { name, price, features } = body;
    if (!name || typeof price !== 'number' || !features) {
      return NextResponse.json({ error: 'name, price, and features are required.' }, { status: 400 });
    }
    const plan = await prisma.plan.create({
      data: { name, price, features },
    });
    return NextResponse.json({ plan });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create plan.' }, { status: 500 });
  }
} 