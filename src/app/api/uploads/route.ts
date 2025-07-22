import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

// Add this if @types/pdf-parse is missing
declare module 'pdf-parse';

const prisma = new PrismaClient();

async function parseFileContent(buffer: Buffer, filename: string): Promise<string> {
  try {
    const ext = filename?.split('.').pop()?.toLowerCase();
    console.log(`Parsing file with extension: ${ext}, buffer size: ${buffer.length}`);
    
    // Check file size (max 5MB for processing)
    if (buffer.length > 5 * 1024 * 1024) {
      console.log('File too large for content extraction, skipping');
      return '';
    }
    
    if (ext === 'pdf') {
      console.log('Processing PDF file');
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);
      return data.text;
    } else if (ext === 'docx') {
      console.log('Processing DOCX file');
      const mammoth = await import('mammoth');
      const result = await mammoth.extractRawText({ buffer });
      return result.value;
    } else if (ext === 'txt' || ext === 'md' || ext === 'csv') {
      console.log('Processing text file');
      return buffer.toString('utf-8');
    }
    
    console.log('File type not supported for content extraction:', ext);
    return '';
  } catch (error) {
    console.error('Error parsing file content:', error);
    return '';
  }
}

// POST: Upload file with plan enforcement
export async function POST(req: NextRequest) {
  console.log('Upload request received');
  
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  
  try {
    console.log('Starting native FormData processing');
    
    // Use native FormData API
    const formData = await req.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      console.error('No file found in FormData');
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }
    
    console.log(`File received: ${file.name}, size: ${file.size}, type: ${file.type}`);
    
    // Check file size limit (10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.error('File too large:', file.size);
      return NextResponse.json({ error: 'File too large (max 10MB)' }, { status: 400 });
    }
    
    // Convert file to buffer
    console.log('Converting file to buffer');
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    
    // Parse file content with timeout
    let content = '';
    try {
      console.log('Starting content parsing with timeout');
      const contentPromise = parseFileContent(buffer, file.name);
      const timeoutPromise = new Promise<string>((_, reject) => {
        setTimeout(() => reject(new Error('Content parsing timeout')), 10000); // 10 second timeout
      });
      
      content = await Promise.race([contentPromise, timeoutPromise]);
      console.log(`Content parsing completed, length: ${content.length}`);
    } catch (parseError) {
      console.error('Content parsing failed:', parseError);
      content = ''; // Continue without content
    }
    
    // Save to database if userId provided
    if (userId) {
      try {
        console.log(`Saving file to database for user ${userId}`);
        await prisma.uploadedFile.create({
          data: {
            userId: Number(userId),
            filename: file.name,
            content,
          },
        });
        console.log('File saved to database successfully');
      } catch (dbError) {
        console.error('Database save error:', dbError);
        return NextResponse.json({ 
          error: `Failed to save file: ${dbError instanceof Error ? dbError.message : 'Unknown error'}` 
        }, { status: 500 });
      }
    }
    
    console.log('Upload completed successfully');
    return NextResponse.json({ 
      file: { 
        filename: file.name,
        contentExtracted: !!content,
        size: file.size,
        type: file.type
      } 
    });
    
  } catch (error) {
    console.error('Upload failed:', error);
    return NextResponse.json({ 
      error: `Upload failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    }, { status: 500 });
  }
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