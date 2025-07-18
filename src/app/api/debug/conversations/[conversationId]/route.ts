import { NextRequest, NextResponse } from 'next/server';

export async function GET(_req: NextRequest, { params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = await params;
  // Simplified debug endpoint - conversation store temporarily disabled
  return NextResponse.json({ 
    message: 'Debug endpoint - conversation store temporarily disabled for build',
    conversationId,
    conversation: null
  });
} 