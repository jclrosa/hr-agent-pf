import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(req: NextRequest) {
  try {
    const { message, workflow, conversationId } = await req.json();

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 });
    }

    // Determine temperature based on workflow
    const temperature = workflow ? 0.3 : 0.7;

    // Build system prompt based on workflow
    let systemPrompt = "You are an expert HR consultant helping with human resources tasks.";
    
    if (workflow) {
      const workflowPrompts: Record<string, string> = {
        'job-description': `You are creating a comprehensive job description. Include: Company Overview, Role Overview, Key Responsibilities, Required Experience, Leadership Requirements, and Compensation (ensure compliance with state laws regarding salary transparency).`,
        'interview-plan': `You are creating a structured interview plan. Include: Schedule & Responsibilities, STAR Method Questions, Legal Compliance Tips, and Rating System for candidates.`,
        'parental-leave': `You are creating a parental leave policy. Include: Disability Leave details, Compensation/Benefits, Required Paperwork Instructions, Privacy considerations, and Check-in Points schedule.`,
        'onboarding-plan': `You are creating an onboarding plan. Include: Standing Meetings setup, Introductory Meetings schedule, Key Contacts list, Goal Setting (30/60/90 days), and Feedback/Check-ins structure.`,
        'performance-review': `You are creating a performance review proposal. Include: Program Goals, Feedback Measurement methods, Training Requirements, Feedback Gathering process, and Data Utilization/Storage policies.`
      };
      
      systemPrompt = workflowPrompts[workflow] || systemPrompt;
    }

    // Call OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: message }
      ],
      temperature,
      max_tokens: 2000,
    });

    const response = completion.choices[0]?.message?.content || 'No response generated';

    return NextResponse.json({
      response,
      conversationId: conversationId || 'temp-' + Date.now(),
      workflow
    });
  } catch (error) {
    console.error('Chat API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 