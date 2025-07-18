import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// Create user
export async function POST(req: NextRequest) {
  const body = await req.json();
  const { email, name, company } = body;
  if (!email) return NextResponse.json({ error: 'Email required' }, { status: 400 });
  try {
    const user = await prisma.user.create({
      data: { email, name, company },
    });
    return NextResponse.json({ user });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Get user by email or id
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const email = searchParams.get('email');
  const id = searchParams.get('id');
  try {
    let user = null;
    if (email) {
      user = await prisma.user.findUnique({ where: { email } });
    } else if (id) {
      user = await prisma.user.findUnique({ where: { id: Number(id) } });
    }
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
    return NextResponse.json({ user });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// Update user by id (from session or param)
export async function PUT(req: NextRequest) {
  const session = await getServerSession();
  const body = await req.json();
  const { id, name, company, planId } = body;
  if (!id && !session?.user?.email) return NextResponse.json({ error: 'User id or session required' }, { status: 400 });
  try {
    let user = null;
    if (id) {
      user = await prisma.user.update({ where: { id: Number(id) }, data: { name, company, planId } });
    } else {
      user = await prisma.user.update({ where: { email: session.user.email }, data: { name, company, planId } });
    }
    return NextResponse.json({ user });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
} 