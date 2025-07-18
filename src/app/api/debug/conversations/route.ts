import { NextResponse } from 'next/server';

export async function GET() {
  // Simplified debug endpoint - conversation store temporarily disabled
  return NextResponse.json({ 
    message: 'Debug endpoint - conversation store temporarily disabled for build',
    conversations: {}
  });
} 