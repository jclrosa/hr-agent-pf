"use client";

import { useState, useEffect, useRef } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

interface ChatProps {
  className?: string;
}

export default function Chat({ className = '' }: ChatProps) {
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [fileContext, setFileContext] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Get user ID and file context when session changes
  useEffect(() => {
    const fetchUserAndContext = async () => {
      if (!session?.user?.email) return;

      try {
        // Get user ID
        const userResponse = await fetch(`/api/users?email=${session.user.email}`);
        if (userResponse.ok) {
          const userData = await userResponse.json();
          const userId = userData.user.id;

          // Get file context
          const contextResponse = await fetch(`/api/uploads/context?userId=${userId}`);
          if (contextResponse.ok) {
            const contextData = await contextResponse.json();
            setFileContext(contextData.context || '');
          }
        }
      } catch (error) {
        console.error('Error fetching user data:', error);
      }
    };

    fetchUserAndContext();
  }, [session]);

  const sendMessage = async () => {
    if (!inputMessage.trim() || !session?.user?.email) return;

    const userMessage = inputMessage.trim();
    setInputMessage('');
    setIsLoading(true);

    // Add user message to UI immediately
    const newUserMessage: Message = {
      role: 'user',
      content: userMessage,
      timestamp: new Date(),
    };
    setMessages(prev => [...prev, newUserMessage]);

    try {
      // Get user ID
      const userResponse = await fetch(`/api/users?email=${session.user.email}`);
      if (!userResponse.ok) {
        throw new Error('Failed to get user information');
      }
      const userData = await userResponse.json();
      const userId = userData.user.id;

      // Send message to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: userMessage,
          conversationId,
          userId,
          fileContext,
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
      
      // Update conversation ID if it's new
      if (data.conversationId && data.conversationId !== conversationId) {
        setConversationId(data.conversationId);
      }

      // Add assistant response to UI
      const assistantMessage: Message = {
        role: 'assistant',
        content: data.reply,
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, assistantMessage]);

      // Show completion toast if workflow is complete
      if (data.is_complete) {
        toast.success('Workflow completed successfully!');
      }

    } catch (error) {
      console.error('Chat error:', error);
      toast.error('Failed to send message. Please try again.');
      
      // Add error message to chat
      const errorMessage: Message = {
        role: 'assistant',
        content: 'I apologize, but I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const workflowTriggers = [
    { emoji: '🟩', text: 'Creating a Job Description', description: 'Generate professional job descriptions' },
    { emoji: '🎯', text: 'Creating an Interview Plan and Scorecard', description: 'Design interview processes' },
    { emoji: '👶', text: 'Communicating a Parental Leave', description: 'Handle parental leave communications' },
    { emoji: '🚀', text: 'Creating a New Hire Onboarding Plan', description: 'Build onboarding programs' },
    { emoji: '📊', text: 'Creating a Performance Review Proposal', description: 'Develop performance management' },
  ];

  if (!session) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center text-gray-600">
          Please log in to access the AI chat assistant.
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow flex flex-col h-96 ${className}`}>
      {/* Header */}
      <div className="border-b p-4">
        <h3 className="text-lg font-semibold text-gray-900">HR AI Assistant</h3>
        <p className="text-sm text-gray-600">Ask me anything about HR processes and policies</p>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 py-8">
            <div className="mb-4">
              <div className="text-2xl mb-2">👋</div>
              <p className="text-sm">I'm your HR assistant! I can help with:</p>
            </div>
            <div className="space-y-2">
              {workflowTriggers.map((trigger, index) => (
                <button
                  key={index}
                  onClick={() => setInputMessage(trigger.emoji + ' ' + trigger.text)}
                  className="block w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                >
                  <div className="font-medium">{trigger.emoji} {trigger.text}</div>
                  <div className="text-xs text-gray-500">{trigger.description}</div>
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                message.role === 'user'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              <div className={`text-xs mt-1 ${
                message.role === 'user' ? 'text-blue-100' : 'text-gray-500'
              }`}>
                {message.timestamp.toLocaleTimeString()}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 text-gray-900 px-4 py-2 rounded-lg">
              <div className="flex items-center space-x-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
                <span>Thinking...</span>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="border-t p-4">
        <div className="flex space-x-2">
          <textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message here..."
            className="flex-1 border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            rows={2}
            disabled={isLoading}
          />
          <button
            onClick={sendMessage}
            disabled={!inputMessage.trim() || isLoading}
            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
} 