"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from 'react-hot-toast';
import FileUpload from '../../components/FileUpload';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export default function HRAgentPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [fileContext, setFileContext] = useState<string>('');
  const [userId, setUserId] = useState<number | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.replace("/");
    }
  }, [status, session, router]);

  // Get user ID when session is available
  useEffect(() => {
    const fetchUserId = async () => {
      if (!session?.user?.email) return;
      
      try {
        const response = await fetch(`/api/users?email=${session.user.email}`);
        if (response.ok) {
          const data = await response.json();
          setUserId(data.user.id);
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      }
    };

    fetchUserId();
  }, [session]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (message: string) => {
    if (!message.trim() || !userId) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: message,
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message,
          conversationId: conversationId,
          userId: userId,
          fileContext: fileContext,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        if (response.status === 403) {
          toast.error(errorData.error || 'AI Agent requires Self-Serve plan or higher');
        } else {
          throw new Error(errorData.error || 'Failed to send message');
        }
        return;
      }

      const data = await response.json();
      
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      };

      setMessages(prev => [...prev, assistantMessage]);
      setConversationId(data.conversationId);

      if (data.is_complete) {
        toast.success('Workflow completed successfully!');
      }
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const handleFileUploaded = (filename: string) => {
    // Refresh file context when new files are uploaded
    fetchFileContext();
  };

  const fetchFileContext = async () => {
    if (!userId) return;
    
    try {
      const response = await fetch(`/api/uploads/context?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setFileContext(data.context || '');
      }
    } catch (error) {
      console.error('Error fetching file context:', error);
    }
  };

  // Load file context when userId is available
  useEffect(() => {
    if (userId) {
      fetchFileContext();
    }
  }, [userId]);

  if (status === 'loading') {
    return <div className="p-8 text-center">Loading...</div>;
  }
  if (!session) {
    return null;
  }

  return (
    <div className="flex flex-col min-h-screen bg-blue-50 text-blue-900">
      <main className="max-w-6xl mx-auto py-8 px-4 flex-1 w-full">
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/dashboard"
            className="text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Dashboard
          </Link>
          <div className="flex items-center">
            <span className="text-blue-600 text-3xl mr-3">🤖</span>
            <h1 className="text-2xl font-bold">HR Agent</h1>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Quick Actions Sidebar */}
          <div className="lg:col-span-1 mb-6 lg:mb-0">
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h3 className="font-semibold text-lg mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button
                  onClick={() => sendMessage(`🟩 Creating a Job Description

I need you to create a comprehensive, legally compliant job description. Please help me generate a high-quality job posting that includes:

**Company Overview**
- Briefly introduce the company and describe its mission, values, and culture

**Role Overview** 
- Write a compelling summary of the position and what makes it unique

**Responsibilities**
- Generate 5-8 core duties associated with the role

**Required Experience**
- List and rank qualifications and experience needed, including education and certifications

**Leadership Requirements** (if applicable)
- If this is a People Manager or above role, include leadership and management experience required

**Compensation Transparency**
- Include salary range placeholder and note that actual ranges may depend on location and experience
- Add legal disclaimer language for compliance with CA, CO, NY compensation transparency statutes

Please ask me for the job title and any specific requirements, then create a professional, inclusive job description specifically following the above sections.`)}
                  className="w-full bg-green-100 hover:bg-green-200 text-green-800 font-medium py-2 px-3 rounded-lg text-sm transition-colors border border-green-300 text-left"
                >
                  🟩 Creating a Job Description
                </button>
                <button
                  onClick={() => sendMessage(`🎯 Creating an Interview Plan and Scorecard

Develop an interview plan and scorecard with instructions for the recruitment process to upload and share via the ATS. This should include:

**Interview Schedule & Responsibilities**
- The sequence in which the interviews will take place
- What each person in the process is responsible for

**STAR Interview Questions**
- Create STAR (Situation, Task, Action, Result) questions for each interviewer
- Focus on their assigned areas

**Legal Compliance Tips**
- Offer suggestions on how to keep the interview process legal and compliant
- Include information on how to capture notes and deliver feedback

**Rating System**
- Include a rating scale for each question

Please ask me for the job title and specific requirements, then create a comprehensive interview plan and scorecard.`)}
                  className="w-full bg-orange-100 hover:bg-orange-200 text-orange-800 font-medium py-2 px-3 rounded-lg text-sm transition-colors border border-orange-300 text-left"
                >
                  🎯 Creating an Interview Plan and Scorecard
                </button>
                <button
                  onClick={() => sendMessage(`👶 Communicating a Parental Leave

Draft an email outlining the parental leave process and timeline for a birthing parent. Include the following information:

**Disability Leave**
- Provide details regarding state and company disability leave entitlements

**Compensation and Benefits**
- Explain how compensation and benefits will be managed during their time away, including gaps and reductions in pay

**Paperwork Instructions**
- Instruct the employee on submitting their approved paperwork from the state to determine any compensation from the company that may supplement state leave, and specify the duration of support

**Privacy**
- Provide instructions on what they are required to send us versus what information they should keep confidential, and where this information will be stored and shared

**Check-in Points**
- Outline how and when check-ins will occur, and provide a point of contact for any additional questions

Please ask me for the employee details and specific requirements, then create a comprehensive parental leave communication.`)}
                  className="w-full bg-pink-100 hover:bg-pink-200 text-pink-800 font-medium py-2 px-3 rounded-lg text-sm transition-colors border border-pink-300 text-left"
                >
                  👶 Communicating a Parental Leave
                </button>
                <button
                  onClick={() => sendMessage(`🚀 Creating a New Hire Onboarding Plan

Develop an onboarding plan for the new employee using the standard onboarding template. Instructions for the manager should include:

**Standing Meetings**
- Suggest scheduling regular meetings

**Introductory Meetings**
- Outline which introductory meetings should be arranged

**Key Contacts**
- Provide a list of key contacts and links to relevant information and templates

**Goal Setting**
- Encourage the manager to establish clear goals for the employee's first 30, 60, and 90 days

**Feedback and Check-ins**
- Outline how and when HR will partner and check in with the manager and employee throughout their first 90 days. Include information on how the data collected will be stored and shared

Please ask me for the role details and specific requirements, then create a comprehensive onboarding plan.`)}
                  className="w-full bg-indigo-100 hover:bg-indigo-200 text-indigo-800 font-medium py-2 px-3 rounded-lg text-sm transition-colors border border-indigo-300 text-left"
                >
                  🚀 Creating a New Hire Onboarding Plan
                </button>
                <button
                  onClick={() => sendMessage(`📊 Creating a Performance Review Proposal

Please create a proposal for a performance review process. Include the following:

**Goals for the Program**
- Outline the objectives of the performance review process. Detail how we will review and measure performance and potential (competencies, values, job descriptions, etc); and the frequency (quarterly, bi-annually, and yearly)

**Feedback Measurement**
- Provide a plan for measuring performance, including a timeline template for different assessments: self-assessment, manager assessment, peer assessment, option for calibrations to ensure balanced inputs

**Training Requirements**
- Identify any training leads and materials that will need to be developed for effective implementation

**Feedback Gathering**
- Recommend strategies for collecting feedback from influential individuals within the organization regarding the program, and explain how their insights will be utilized to deploy the program

**Data Utilization and Storage**
- Outline how the collected data will be used and stored and how it will be used for future decisions: promotion decisions, compensation decisions, development plans, improvement plans, etc

Please ask me for the company details and specific requirements, then create a comprehensive performance review proposal.`)}
                  className="w-full bg-teal-100 hover:bg-teal-200 text-teal-800 font-medium py-2 px-3 rounded-lg text-sm transition-colors border border-teal-300 text-left"
                >
                  📊 Creating a Performance Review Proposal
                </button>
              </div>
            </div>

            {/* File Upload Section */}
            <div className="mt-8">
              <h3 className="text-md font-semibold text-gray-900 mb-3">Company Documents</h3>
              <p className="text-sm text-gray-600 mb-4">
                Upload company documents to provide context for the HR agent
              </p>
              <FileUpload onFileUploaded={handleFileUploaded} />
            </div>
          </div>

          {/* Chat Interface */}
          <div className="lg:col-span-3">
            <div className="bg-white rounded-lg shadow-lg p-8 h-96 flex flex-col">
              <div className="mb-4 flex-1 overflow-y-auto border rounded-lg p-4 bg-gray-50">
                {messages.length === 0 && (
                  <div className="text-gray-400 text-center">
                    <p>Start a conversation with the HR agent</p>
                    <p className="text-sm mt-2">Upload company documents to provide context for more personalized responses</p>
                  </div>
                )}
                
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`mb-3 flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  >
                    <div
                      className={`px-3 py-2 rounded-lg max-w-[80%] text-sm whitespace-pre-wrap break-words ${
                        message.role === 'user'
                          ? 'bg-blue-600 text-white'
                          : 'bg-white text-gray-800 border'
                      }`}
                    >
                      <div className="whitespace-pre-wrap">{message.content}</div>
                      {message.role === 'assistant' && (
                        <button
                          onClick={() => copyToClipboard(message.content)}
                          className="ml-2 text-xs text-gray-500 hover:text-gray-700 font-medium"
                        >
                          📋
                        </button>
                      )}
                    </div>
                  </div>
                ))}
                
                {isLoading && (
                  <div className="mb-3 flex justify-start">
                    <div className="px-3 py-2 rounded-lg bg-white text-gray-800 text-sm animate-pulse border">Agent is typing…</div>
                  </div>
                )}
                
                <div ref={messagesEndRef} />
              </div>
              <form
                className="flex gap-2 mt-4"
                onSubmit={async e => {
                  e.preventDefault();
                  if (!inputMessage.trim()) return;
                  await sendMessage(inputMessage);
                }}
              >
                <input
                  className="flex-1 border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Type your HR question..."
                  value={inputMessage}
                  onChange={e => setInputMessage(e.target.value)}
                  disabled={isLoading}
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg transition"
                  disabled={isLoading || !inputMessage.trim()}
                >
                  Send
                </button>
              </form>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
} 