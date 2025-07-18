import { NextResponse } from 'next/server';
import { getAllConversations } from '@/lib/conversationStore';

export async function GET() {
  return NextResponse.json({ conversations: getAllConversations() });
} 