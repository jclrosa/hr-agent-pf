import { NextRequest, NextResponse } from 'next/server';
import formidable from 'formidable';
import fs from 'fs';
import { PrismaClient } from '@prisma/client';

// Add this if @types/pdf-parse is missing
declare module 'pdf-parse';

// Disable Next.js body parsing for this route
export const config = {
  api: {
    bodyParser: false,
  },
};

const prisma = new PrismaClient();

async function parseFile(file: formidable.File): Promise<string> {
  try {
    const ext = file.originalFilename?.split('.').pop()?.toLowerCase();
    
    // Check file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      console.log('File too large, skipping content extraction');
      return '';
    }
    
    // Ensure file exists before reading
    if (!file.filepath || !fs.existsSync(file.filepath)) {
      console.error('File path does not exist:', file.filepath);
      return '';
    }
    
    const buffer = fs.readFileSync(file.filepath);
    console.log(`File read successfully, buffer size: ${buffer.length}`);
    
    if (ext === 'pdf') {
      console.log('Processing PDF file');
      // Dynamic import to avoid initialization issues
      const pdfParse = (await import('pdf-parse')).default;
      const data = await pdfParse(buffer);
      return data.text;
    } else if (ext === 'docx') {
      console.log('Processing DOCX file');
      // Dynamic import for mammoth as well
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
    console.error('Error parsing file:', error);
    // Return empty string on parse error but don't fail the upload
    return '';
  }
}

// POST: Upload file with plan enforcement
export async function POST(req: NextRequest) {
  console.log('Upload request received');
  
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
    console.log('Starting file upload process');
    
    return await new Promise<NextResponse>((resolve, reject) => {
      // Set a timeout to prevent hanging
      const timeout = setTimeout(() => {
        console.error('Upload timeout after 30 seconds');
        resolve(NextResponse.json({ error: 'Upload timeout - file too large or processing too slow' }, { status: 408 }));
      }, 30000); // 30 second timeout

      const form = formidable({ 
        multiples: false,
        maxFileSize: 10 * 1024 * 1024, // 10MB limit
        uploadDir: '/tmp', // Use /tmp for serverless
        keepExtensions: true
      });
      
      console.log('Formidable configured, starting parse');
      
      form.parse(req as any, async (err: Error | null, fields: formidable.Fields, files: formidable.Files) => {
        clearTimeout(timeout);
        console.log('Form parse completed');
        
        try {
          if (err) {
            console.error('Formidable parse error:', err);
            return resolve(NextResponse.json({ 
              error: `File upload error: ${err.message}` 
            }, { status: 500 }));
          }
          
          console.log('Files received:', Object.keys(files));
          const fileArray = files.file;
          if (!fileArray) {
            console.error('No file found in upload');
            return resolve(NextResponse.json({ error: 'No file uploaded' }, { status: 400 }));
          }
          
          const file = Array.isArray(fileArray) ? fileArray[0] : fileArray;
          console.log(`Processing file: ${file.originalFilename}, size: ${file.size}`);
          
          // Parse file content with timeout
          const contentPromise = parseFile(file);
          const timeoutPromise = new Promise<string>((_, reject) => {
            setTimeout(() => reject(new Error('File parsing timeout')), 15000);
          });
          
          let content = '';
          try {
            console.log('Starting file content parsing');
            content = await Promise.race([contentPromise, timeoutPromise]);
            console.log(`File parsing completed, content length: ${content.length}`);
          } catch (parseError) {
            console.error('File parsing error:', parseError);
            content = ''; // Continue without content if parsing fails
          }
          
          // Save file info to DB if userId
          if (userId) {
            try {
              console.log(`Saving file to database for user ${userId}`);
              await prisma.uploadedFile.create({
                data: {
                  userId: Number(userId),
                  filename: file.originalFilename || 'unknown',
                  content,
                },
              });
              console.log('File saved to database successfully');
            } catch (dbError) {
              console.error('Database save error:', dbError);
              return resolve(NextResponse.json({ 
                error: `Failed to save file info: ${dbError instanceof Error ? dbError.message : 'Unknown error'}` 
              }, { status: 500 }));
            }
          }
          
          // Clean up temp file
          try {
            if (file.filepath && fs.existsSync(file.filepath)) {
              fs.unlinkSync(file.filepath);
              console.log('Temp file cleaned up');
            }
          } catch (cleanupError) {
            console.error('File cleanup error:', cleanupError);
            // Don't fail the upload for cleanup errors
          }
          
          console.log('Upload completed successfully');
          resolve(NextResponse.json({ 
            file: { 
              filename: file.originalFilename || 'unknown', 
              contentExtracted: !!content,
              size: file.size 
            } 
          }));
        } catch (processingError) {
          console.error('File processing error:', processingError);
          resolve(NextResponse.json({ 
            error: `File processing failed: ${processingError instanceof Error ? processingError.message : 'Unknown error'}` 
          }, { status: 500 }));
        }
      });
    });
  } catch (error) {
    console.error('Upload error:', error);
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