import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// List templates with plan enforcement
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  // const userId = searchParams.get('userId'); // Unused while plan enforcement is bypassed
  const templates = await prisma.template.findMany({ where: { }, orderBy: { createdAt: 'desc' } });
  
  // TODO: Temporarily bypass plan enforcement for testing
  /*
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: Number(userId) }, include: { plan: true } });
    if (user && user.plan) {
      const maxTemplates = (user.plan.features as any)?.templates || templates.length;
      templates = templates.slice(0, maxTemplates);
    }
  }
  */
  
  return NextResponse.json({ templates });
}

// Create template
export async function POST(req: NextRequest) {
  const { title, description, category, content, fields } = await req.json();
  const templateData = await prisma.template.create({
    data: {
      title,
      category,
      content,
    },
  });
  return NextResponse.json({ template: templateData });
}

// Update template by id
export async function PUT(req: NextRequest) {
  const { id, title, description, category, content, fields } = await req.json();
  const updatedTemplate = await prisma.template.update({
    where: { id: Number(id) },
    data: { title, category, content },
  });
  return NextResponse.json({ template: updatedTemplate });
} 