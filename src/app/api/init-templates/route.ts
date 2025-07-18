import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST() {
  const templatesData = [
    {
      title: 'Offer Letter',
      content: 'Subject: Offer of Employment\n\nDear [Candidate Name],\n\nWe are pleased to offer you the position of [Job Title] at [Company Name]. Please find attached the terms and conditions of your employment.\n\nSincerely,\n[Your Name]\n[Company Name]',
      category: 'hiring',
    },
    {
      title: 'Onboarding Checklist',
      content: '- Welcome email sent\n- Employee handbook provided\n- Payroll information collected\n- Equipment assigned\n- First-day orientation scheduled',
      category: 'onboarding',
    },
    {
      title: 'Termination Letter',
      content: 'Subject: Notice of Termination\n\nDear [Employee Name],\n\nWe regret to inform you that your employment with [Company Name] will end effective [Date]. Please contact HR for next steps.\n\nSincerely,\n[Your Name]\n[Company Name]',
      category: 'termination',
    },
  ];
  for (const template of templatesData) {
    const existing = await prisma.template.findFirst({ where: { title: template.title } });
    if (!existing) {
      await prisma.template.create({ data: { ...template } });
    }
  }
  return NextResponse.json({ message: 'Templates initialized successfully' });
} 