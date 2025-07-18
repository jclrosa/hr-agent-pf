import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import OpenAI from 'openai';
import {
  getOrCreateConversation,
  addMessageToConversation,
  getConversationMessages,
  getConversationContext,
  updateConversationContext,
} from '@/lib/conversationStore';

const prisma = new PrismaClient();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

// OpenAI Temperature Configuration
const OPENAI_TEMPERATURE = 0.7; // Default
const OPENAI_TEMPERATURE_CREATIVE = 0.9; // For creative tasks
const OPENAI_TEMPERATURE_FOCUSED = 0.3; // For focused tasks (workflows)

const WORKFLOWS = [
  { key: 'job_description', trigger: '🟩 Creating a Job Description' },
  { key: 'interview_plan', trigger: '🎯 Creating an Interview Plan and Scorecard' },
  { key: 'parental_leave', trigger: '👶 Communicating a Parental Leave' },
  { key: 'onboarding_plan', trigger: '🚀 Creating a New Hire Onboarding Plan' },
  { key: 'performance_review_proposal', trigger: '📊 Creating a Performance Review Proposal' },
];

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { message, conversationId: cid, userId, fileContext } = body;
  if (!message) return NextResponse.json({ error: 'Message is required.' }, { status: 400 });

  // TEMPORARY: Plan enforcement bypassed for testing
  // TODO: Re-enable plan enforcement after testing
  /*
  if (userId) {
    const user = await prisma.user.findUnique({ where: { id: Number(userId) }, include: { plan: true } });
    if (!user || !user.plan || !(user.plan.features as any)?.ai_agent) {
      return NextResponse.json({ error: 'AI Agent requires Self-Serve plan or higher' }, { status: 403 });
    }
  }
  */

  try {
    // Conversation context
    const conversationId = getOrCreateConversation(cid);
    addMessageToConversation(conversationId, 'user', message);
    let context = getConversationContext(conversationId);
    let workflow = context.workflow;

    // Detect or update workflow
    if (!workflow) {
      for (const wf of WORKFLOWS) {
        if (message.includes(wf.trigger)) {
          workflow = wf.key;
          updateConversationContext(conversationId, { workflow, step: 'initial' });
          context = getConversationContext(conversationId);
          break;
        }
      }
    }

    // File context
    let file_context = fileContext || '';
    if (userId && !file_context) {
      const files = await prisma.uploadedFile.findMany({ where: { userId: Number(userId) } });
      file_context = files.map(f => `--- ${f.filename} ---\n${f.content}\n`).join('\n');
    }

    // Workflow handlers
    let agent_reply = '';
    if (workflow) {
      agent_reply = await handleWorkflow(workflow, conversationId, message, context, file_context);
    } else {
      agent_reply = await handleGeneralChat(conversationId, message, getConversationMessages(conversationId), file_context);
    }
    addMessageToConversation(conversationId, 'assistant', agent_reply, workflow);
    const is_complete = getConversationContext(conversationId).workflow_complete || false;
    return NextResponse.json({ reply: agent_reply, conversationId, is_complete });
  } catch (e: any) {
    return NextResponse.json({
      reply: `I'm here to help with your HR questions! (Error: ${e.message})`,
      conversationId: cid || getOrCreateConversation(),
      is_complete: false,
    });
  }
}

// Workflow handler with exact specifications
async function handleWorkflow(workflow: string, conversationId: string, userMessage: string, context: any, fileContext: string): Promise<string> {
  switch (workflow) {
    case 'job_description':
      return await handleJobDescriptionWorkflow(conversationId, userMessage, context, fileContext);
    case 'interview_plan':
      return await handleInterviewPlanWorkflow(conversationId, userMessage, context, fileContext);
    case 'parental_leave':
      return await handleParentalLeaveWorkflow(conversationId, userMessage, context, fileContext);
    case 'onboarding_plan':
      return await handleOnboardingPlanWorkflow(conversationId, userMessage, context, fileContext);
    case 'performance_review_proposal':
      return await handlePerformanceReviewProposalWorkflow(conversationId, userMessage, context, fileContext);
    default:
      return "I'm here to help with your HR questions! What specific HR challenge are you facing today?";
  }
}

async function handleJobDescriptionWorkflow(conversationId: string, userMessage: string, context: any, fileContext: string): Promise<string> {
  const step = context.step || 'initial';

  if (step === 'initial') {
    updateConversationContext(conversationId, { step: 'collecting_details' });
    return `I'll help you create a job description template that complies with compensation statutes across various states.

The job description will include these specific sections:

**Company Overview**: Brief company introduction including company values
**Role Overview**: Compelling description of the position  
**Responsibilities**: Key responsibilities of the role
**Required Experience**: Necessary past experience, listed and ranked
**Leadership Requirements**: For Manager roles, leadership qualifications for People Managers
**Compensation**: Salary ranges for compliance with state compensation statutes

Please provide me with:
1. Job title
2. Company information and values
3. Key responsibilities for this role
4. Required experience and qualifications
5. Is this a People Manager role? (Yes/No)
6. Salary range for the position`;
  }

  if (step === 'collecting_details') {
    updateConversationContext(conversationId, { details: { user_input: userMessage } });
    
    if (userMessage.length > 50) {
      const systemPrompt = `You are an expert HR consultant specializing in job description creation. Create a comprehensive, legally compliant job description that includes compensation ranges as required by state statutes.

STRICTLY follow this structure:
1. **Company Overview** - Brief company introduction including values
2. **Role Overview** - Compelling position description  
3. **Responsibilities** - Key duties (5-8 bullet points)
4. **Required Experience** - Necessary qualifications, ranked by importance
5. **Leadership Requirements** - (Only if People Manager role) Leadership qualifications
6. **Compensation & Benefits** - Salary range and benefits (include compliance disclaimer)
7. **Application Instructions** - How to apply

Include legal compliance disclaimer: "Actual salary ranges may depend on location, experience, and qualifications. This posting complies with CA, CO, NY compensation transparency statutes."

${fileContext ? `\n--- Company Documents Context ---\n${fileContext}\n--- End Context ---` : ''}`;

      try {
        const completion = await openai.chat.completions.create({
          model: 'gpt-4',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: `Create a professional job description based on these details: ${userMessage}` },
          ],
          max_tokens: 1200,
          temperature: OPENAI_TEMPERATURE_FOCUSED, // Use focused temperature
        });

        const jobDescription = completion.choices[0]?.message?.content || '';
        updateConversationContext(conversationId, {
          step: 'complete',
          workflow_complete: true,
          job_description: jobDescription
        });

        return `Perfect! Here's your compliant job description template:

---

${jobDescription}

---

This job description includes compensation transparency compliance and is ready for posting on job boards or your ATS system.`;
      } catch (error) {
        return `I apologize, but I encountered an error creating your job description. Please try again with your requirements.`;
      }
    } else {
      return 'Please provide more details about the job title, company, responsibilities, required experience, and salary range so I can create a complete job description.';
    }
  }

  return context.job_description || 'Your job description is ready.';
}

async function handleInterviewPlanWorkflow(conversationId: string, userMessage: string, context: any, fileContext: string): Promise<string> {
  const step = context.step || 'initial';

  if (step === 'initial') {
    updateConversationContext(conversationId, { step: 'collecting_details' });
    return `I'll help you develop a comprehensive interview plan and scorecard for your recruitment process.

The plan will include:

**Interview Schedule & Responsibilities**: Sequence of interviews and each person's role
**STAR Interview Questions**: Situation, Task, Action, Result questions for each interviewer
**Legal Compliance Tips**: How to keep the process legal and compliant
**Rating System**: Rating scale for each question
**Note-taking & Feedback**: How to capture notes and deliver feedback

Please provide:
1. Position/role being interviewed for
2. Interview team (who will be interviewing)
3. Key competencies to assess
4. Interview format preference (in-person, virtual, panel, etc.)
5. Any specific legal considerations for your industry/location`;
  }

  if (step === 'collecting_details') {
    updateConversationContext(conversationId, { details: { user_input: userMessage } });

    const systemPrompt = `You are an expert HR consultant specializing in interview planning and legal compliance. Create a comprehensive interview plan and scorecard.

STRICTLY follow this structure:
1. **Interview Schedule & Responsibilities** - Sequence and roles
2. **STAR Interview Questions** - Specific STAR questions for each interviewer
3. **Legal Compliance Tips** - How to stay compliant, note-taking guidelines
4. **Rating System** - Clear rating scale (1-5 with descriptions)
5. **Scorecard Template** - Evaluation form for consistent assessment
6. **Next Steps** - Post-interview process

Focus on legal compliance and structured evaluation. Include specific STAR questions tailored to the role.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create an interview plan and scorecard for: ${userMessage}` },
        ],
        max_tokens: 1500,
        temperature: OPENAI_TEMPERATURE_FOCUSED,
      });

      const interviewPlan = completion.choices[0]?.message?.content || '';
      updateConversationContext(conversationId, {
        step: 'complete',
        workflow_complete: true,
        interview_plan: interviewPlan
      });

      return `Excellent! Here's your comprehensive interview plan and scorecard:

---

${interviewPlan}

---

This plan is ready to upload to your ATS and share with your interview team.`;
    } catch (error) {
      return `I apologize, but I encountered an error creating your interview plan. Please try again with your requirements.`;
    }
  }

  return context.interview_plan || 'Your interview plan is ready.';
}

async function handleParentalLeaveWorkflow(conversationId: string, userMessage: string, context: any, fileContext: string): Promise<string> {
  const step = context.step || 'initial';

  if (step === 'initial') {
    updateConversationContext(conversationId, { step: 'collecting_details' });
    return `I'll help you draft a comprehensive parental leave communication email for a birthing parent.

The email will include:

**Disability Leave**: State and company disability leave entitlements
**Compensation and Benefits**: How pay and benefits are managed during leave
**Paperwork Instructions**: Required state paperwork and company processes
**Privacy**: What information to share vs. keep confidential
**Check-in Points**: Schedule and contact information

Please provide:
1. Employee name and role
2. Expected due date
3. State where employee works
4. Company's parental leave policy details
5. Benefits continuation information
6. HR contact information`;
  }

  if (step === 'collecting_details') {
    updateConversationContext(conversationId, { details: { user_input: userMessage } });

    const systemPrompt = `You are an expert HR consultant specializing in parental leave policies. Create a comprehensive, professional parental leave communication email.

STRICTLY follow this structure:
1. **Subject Line** - Professional and clear
2. **Congratulations** - Warm acknowledgment of pregnancy
3. **Disability Leave** - State and company entitlements details
4. **Compensation and Benefits** - Pay and benefits during leave, including gaps
5. **Paperwork Instructions** - State paperwork submission and company supplementation
6. **Privacy** - What to share vs. keep confidential, data storage/sharing
7. **Check-in Points** - When and how check-ins occur, contact person
8. **Next Steps** - Clear action items with deadlines

Focus on legal compliance and clear communication of benefits and processes.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create a parental leave communication for: ${userMessage}` },
        ],
        max_tokens: 1500,
        temperature: OPENAI_TEMPERATURE_FOCUSED,
      });

      const parentalLeaveComm = completion.choices[0]?.message?.content || '';
      updateConversationContext(conversationId, {
        step: 'complete',
        workflow_complete: true,
        parental_leave_communication: parentalLeaveComm
      });

      return `Perfect! Here's your comprehensive parental leave communication:

---

${parentalLeaveComm}

---

This communication is ready to send and covers all required legal and procedural information.`;
    } catch (error) {
      return `I apologize, but I encountered an error creating your parental leave communication. Please try again.`;
    }
  }

  return context.parental_leave_communication || 'Your parental leave communication is ready.';
}

async function handleOnboardingPlanWorkflow(conversationId: string, userMessage: string, context: any, fileContext: string): Promise<string> {
  const step = context.step || 'initial';

  if (step === 'initial') {
    updateConversationContext(conversationId, { step: 'collecting_details' });
    return `I'll help you develop a comprehensive onboarding plan for your new employee using the standard onboarding template.

The plan will include manager instructions for:

**Standing Meetings**: Regular meeting schedule suggestions
**Introductory Meetings**: Key introductory meetings to arrange
**Key Contacts**: List of contacts and links to information/templates  
**Goal Setting**: 30, 60, and 90-day goals framework
**Feedback and Check-ins**: HR partnership schedule and data collection/sharing

Please provide:
1. New employee's role and department
2. Manager's name and experience level
3. Key stakeholders the employee should meet
4. Company size and structure
5. Specific goals or objectives for first 90 days`;
  }

  if (step === 'collecting_details') {
    updateConversationContext(conversationId, { details: { user_input: userMessage } });

    const systemPrompt = `You are an expert HR consultant specializing in employee onboarding. Create a comprehensive onboarding plan with specific manager instructions.

STRICTLY follow this structure:
1. **Standing Meetings** - Regular meeting schedule recommendations
2. **Introductory Meetings** - Key stakeholder meetings to arrange
3. **Key Contacts** - Important contacts and resource links
4. **Goal Setting** - Clear 30/60/90-day goals framework
5. **Feedback and Check-ins** - HR partnership schedule, data collection/sharing process
6. **Week 1 Plan** - Detailed first week activities
7. **Success Metrics** - How to measure onboarding effectiveness

Focus on actionable instructions for managers and clear timelines.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create an onboarding plan for: ${userMessage}` },
        ],
        max_tokens: 1500,
        temperature: OPENAI_TEMPERATURE_FOCUSED,
      });

      const onboardingPlan = completion.choices[0]?.message?.content || '';
      updateConversationContext(conversationId, {
        step: 'complete',
        workflow_complete: true,
        onboarding_plan: onboardingPlan
      });

      return `Excellent! Here's your comprehensive onboarding plan:

---

${onboardingPlan}

---

This plan is ready to share with the manager and can be customized for your specific needs.`;
    } catch (error) {
      return `I apologize, but I encountered an error creating your onboarding plan. Please try again.`;
    }
  }

  return context.onboarding_plan || 'Your onboarding plan is ready.';
}

async function handlePerformanceReviewProposalWorkflow(conversationId: string, userMessage: string, context: any, fileContext: string): Promise<string> {
  const step = context.step || 'initial';

  if (step === 'initial') {
    updateConversationContext(conversationId, { step: 'collecting_details' });
    return `I'll help you create a comprehensive performance review process proposal.

The proposal will include:

**Goals for the Program**: Objectives, measurement criteria, and frequency
**Feedback Measurement**: Performance measurement plan and timeline template
**Training Requirements**: Training needs and material development
**Feedback Gathering**: Strategies for collecting organizational input
**Data Utilization and Storage**: How data will be used and stored for decisions

Please provide:
1. Company size and current review process (if any)
2. Desired review frequency (quarterly, bi-annually, annually)
3. Key stakeholders who will be involved
4. Current performance challenges or goals
5. Technology/systems available for implementation`;
  }

  if (step === 'collecting_details') {
    updateConversationContext(conversationId, { details: { user_input: userMessage } });

    const systemPrompt = `You are an expert HR consultant specializing in performance management systems. Create a comprehensive performance review process proposal.

STRICTLY follow this structure:
1. **Goals for the Program** - Objectives, performance/potential measurement, frequency
2. **Feedback Measurement** - Performance measurement plan, timeline template (self/manager/peer assessments, calibrations)
3. **Training Requirements** - Training needs and material development for implementation
4. **Feedback Gathering** - Strategies for collecting organizational input and utilization
5. **Data Utilization and Storage** - How data is used/stored for promotion, compensation, development, improvement decisions
6. **Implementation Timeline** - Phased rollout plan
7. **Success Metrics** - How to measure program effectiveness

Focus on practical implementation and clear business outcomes.`;

    try {
      const completion = await openai.chat.completions.create({
        model: 'gpt-4',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Create a performance review proposal for: ${userMessage}` },
        ],
        max_tokens: 2000,
        temperature: OPENAI_TEMPERATURE_FOCUSED,
      });

      const performanceProposal = completion.choices[0]?.message?.content || '';
      updateConversationContext(conversationId, {
        step: 'complete',
        workflow_complete: true,
        performance_review_proposal: performanceProposal
      });

      return `Perfect! Here's your comprehensive performance review proposal:

---

${performanceProposal}

---

This proposal is ready for leadership review and implementation planning.`;
    } catch (error) {
      return `I apologize, but I encountered an error creating your performance review proposal. Please try again.`;
    }
  }

  return context.performance_review_proposal || 'Your performance review proposal is ready.';
}

// General chat handler
async function handleGeneralChat(conversationId: string, userMessage: string, messages: any[], fileContext: string): Promise<string> {
  const systemPrompt = `You are an expert HR consultant with deep knowledge of employment law, best practices, and modern workplace dynamics. You help startups and growing companies with HR challenges.

Your expertise includes:
- Employment law and compliance
- Recruitment and hiring  
- Performance management
- Employee relations
- Compensation and benefits
- Workplace culture and DEI
- HR policies and procedures

Always provide practical, actionable advice with legal compliance considerations. Keep responses professional and concise.

${fileContext ? `\n--- File Context ---\n${fileContext}\n--- End File Context ---` : ''}`;

  const chatMessages = [
    { role: 'system', content: systemPrompt },
    ...messages.slice(-10).map(m => ({ role: m.role, content: m.content })),
  ];

  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: chatMessages,
      max_tokens: 500,
      temperature: OPENAI_TEMPERATURE, // Standard temperature for general chat
    });
    return completion.choices[0]?.message?.content || "I'm here to help with your HR questions!";
  } catch (error) {
    return "I'm here to help with your HR questions! What specific HR challenge are you facing today?";
  }
} 