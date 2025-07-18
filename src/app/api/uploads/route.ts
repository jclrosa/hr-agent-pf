import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

// Add this if @types/pdf-parse is missing
declare module 'pdf-parse';

export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient();

async function parseFile(file: formidable.File): Promise<string> {
  try {
    const ext = file.originalFilename?.split('.').pop()?.toLowerCase();
    const buffer = fs.readFileSync(file.filepath);
    
    if (ext === 'pdf') {
      // Dynamic import to avoid initialization issues
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);
      return data.text;
    } else if (ext === 'docx') {
      // Dynamic import for mammoth as well
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (ext === 'txt' || ext === 'md' || ext === 'csv') {
      return buffer.toString('utf-8');
    }
    return '';
  } catch (error) {
    console.error('Error parsing file:', error);
    // Return empty string on parse error but don't fail the upload
    return '';
  }
}

// POST: Upload file with plan enforcement
export async function POST(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  
  // TODO: Temporarily bypass plan enforcement for testing
  /*
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: Number(userId) }, include: { plan: true } });
    if (!user || !user.plan || !(user.plan.features as any)?.file_upload) {
      return NextResponse.json({ error: 'File upload requires Self-Serve plan or higher' }, { status: 403 });
    }
  }
  */
  
  return new Promise((resolve, reject) => {
    const form = formidable({ multiples: false });
    form.parse(req as any, async (err: any, fields: any, files: any) => {
      if (err) return resolve(NextResponse.json({ error: 'File upload error' }, { status: 500 }));
      const file = files.file;
      if (!file) return resolve(NextResponse.json({ error: 'No file uploaded' }, { status: 400 }));
      const content = await parseFile(file);
      // Save file info to DB if userId
      if (userId) {
        await prisma.uploadedFile.create({
          data: {
            userId: Number(userId),
            filename: file.originalFilename,
            content,
          },
        });
      }
      resolve(NextResponse.json({ file: { filename: file.originalFilename, contentExtracted: !!content } }));
    });
  });
}

// GET: List uploads with plan enforcement
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  
  // TODO: Temporarily bypass plan enforcement for testing
  /*
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: Number(userId) }, include: { plan: true } });
    if (!user || !user.plan || !(user.plan.features as any)?.file_upload) {
      return NextResponse.json({ error: 'File upload requires Self-Serve plan or higher' }, { status: 403 });
    }
    const files = await prisma.uploadedFile.findMany({ where: { userId: Number(userId) } });
    return NextResponse.json({ files: files.map(f => f.filename) });
  } else {
    // Return all files (for backward compatibility, not recommended for prod)
    const files = await prisma.uploadedFile.findMany();
    return NextResponse.json({ files: files.map(f => f.filename) });
  }
  */
  
  if (userId) {
    const files = await prisma.uploadedFile.findMany({ where: { userId: Number(userId) } });
    return NextResponse.json({ files: files.map(f => f.filename) });
  } else {
    // Return all files (for backward compatibility, not recommended for prod)
    const files = await prisma.uploadedFile.findMany();
    return NextResponse.json({ files: files.map(f => f.filename) });
  }
} 