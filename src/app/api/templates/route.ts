import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// List templates with plan enforcement
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  let templates = await prisma.template.findMany({ where: { }, orderBy: { createdAt: 'desc' } });
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: Number(userId) }, include: { plan: true } });
    if (user && user.plan) {
      const maxTemplates = (user.plan.features as any)?.templates || templates.length;
      templates = templates.slice(0, maxTemplates);
    }
  }
  return NextResponse.json({ templates });
}

// Create template
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { title, content, category } = body;
    if (!title || !content || !category) {
      return NextResponse.json({ error: 'title, content, and category are required.' }, { status: 400 });
    }
    const template = await prisma.template.create({ data: { title, content, category } });
    return NextResponse.json({ template });
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Failed to create template.' }, { status: 500 });
  }
} 