import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getServerSession } from 'next-auth';

const prisma = new PrismaClient();

// Create user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { name, email, planId } = body;
    if (!name || !email) {
      return NextResponse.json({ error: 'name and email are required.' }, { status: 400 });
    }
    const user = await prisma.user.create({
      data: { name, email, planId: planId ? Number(planId) : null },
      include: { plan: true }
    });
    return NextResponse.json({ user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to create user.';
    return NextResponse.json({ error: message }, { status: 500 });
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
  try {
    const body = await req.json();
    const { id, name, email, planId } = body;
    if (!id) {
      return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }
    const user = await prisma.user.update({
      where: { id: Number(id) },
      data: { name, email, planId: planId ? Number(planId) : null },
      include: { plan: true }
    });
    return NextResponse.json({ user });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to update user.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get('id');
    if (!id) {
      return NextResponse.json({ error: 'id is required.' }, { status: 400 });
    }
    await prisma.user.delete({ where: { id: Number(id) } });
    return NextResponse.json({ message: 'User deleted successfully.' });
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Failed to delete user.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
} 