import { NextRequest, NextResponse } from 'next/server';
import { getConversation } from '@/lib/conversationStore';

export async function GET(_req: NextRequest, { params }: { params: { conversationId: string } }) {
  const conversation = getConversation(params.conversationId);
  if (!conversation) {
    return NextResponse.json({ error: 'Conversation not found' }, { status: 404 });
  }
  return NextResponse.json({ conversationId: params.conversationId, conversation });
} 