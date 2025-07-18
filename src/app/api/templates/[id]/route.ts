import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  const templateId = Number(id);
  const template = await prisma.template.findUnique({ where: { id: templateId } });
  if (!template) return NextResponse.json({ error: 'Template not found' }, { status: 404 });
  
  // TODO: Temporarily bypass plan enforcement for testing
  /*
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: Number(userId) }, include: { plan: true } });
    if (user && user.plan) {
      const maxTemplates = (user.plan.features as any)?.templates || 0;
      const allTemplates = await prisma.template.findMany({ orderBy: { createdAt: 'desc' } });
      const allowedIds = allTemplates.slice(0, maxTemplates).map(t => t.id);
      if (!allowedIds.includes(templateId)) {
        return NextResponse.json({ error: 'Template not available in your current plan. Upgrade to access more templates.' }, { status: 403 });
      }
    }
  }
  */
  
  return NextResponse.json({ template });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { title, category, content } = await req.json();
  const updatedTemplate = await prisma.template.update({
    where: { id: Number(id) },
    data: { title, category, content },
  });
  return NextResponse.json({ template: updatedTemplate });
} 