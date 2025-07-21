import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

// Add this if @types/pdf-parse is missing
declare module 'pdf-parse';

const prisma = new PrismaClient();

async function parseFile(file: formidable.File): Promise<string> {
  try {
    const ext = file.originalFilename?.split('.').pop()?.toLowerCase();
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.log('File too large, skipping content extraction');
      return '';
    }
    
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
  
  try {
    return await new Promise<NextResponse>((resolve, reject) => {
      // Set a timeout to prevent hanging
      const timeout = setTimeout(() => {
        reject(new Error('Upload timeout'));
      }, 30000); // 30 second timeout

      const form = formidable({ 
        multiples: false,
        maxFileSize: 10 * 1024 * 1024, // 10MB limit
        uploadDir: '/tmp', // Use /tmp for serverless
        keepExtensions: true
      });
      
      form.parse(req as any, async (err: Error | null, fields: formidable.Fields, files: formidable.Files) => {
        clearTimeout(timeout);
        
        try {
          if (err) {
            console.error('Formidable parse error:', err);
            return resolve(NextResponse.json({ error: 'File upload error' }, { status: 500 }));
          }
          
          const fileArray = files.file;
          if (!fileArray) {
            return resolve(NextResponse.json({ error: 'No file uploaded' }, { status: 400 }));
          }
          
          const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;
          
          // Parse file content with timeout
          const contentPromise = parseFile(file);
          const timeoutPromise = new Promise<string>((_, reject) => {
            setTimeout(() => reject(new Error('File parsing timeout')), 15000);
          });
          
          let content = '';
          try {
            content = await Promise.race([contentPromise, timeoutPromise]);
          } catch (parseError) {
            console.error('File parsing error:', parseError);
            content = ''; // Continue without content if parsing fails
          }
          
          // Save file info to DB if userId
          if (userId) {
            try {
              await prisma.uploadedFile.create({
                data: {
                  userId: Number(userId),
                  filename: file.originalFilename || 'unknown',
                  content,
                },
              });
            } catch (dbError) {
              console.error('Database save error:', dbError);
              return resolve(NextResponse.json({ error: 'Failed to save file info' }, { status: 500 }));
            }
          }
          
          // Clean up temp file
          try {
            if (file.filepath && fs.existsSync(file.filepath)) {
              fs.unlinkSync(file.filepath);
            }
          } catch (cleanupError) {
            console.error('File cleanup error:', cleanupError);
          }
          
          resolve(NextResponse.json({ 
            file: { 
              filename: file.originalFilename || 'unknown', 
              contentExtracted: !!content,
              size: file.size 
            } 
          }));
        } catch (processingError) {
          console.error('File processing error:', processingError);
          resolve(NextResponse.json({ error: 'File processing failed' }, { status: 500 }));
        }
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
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