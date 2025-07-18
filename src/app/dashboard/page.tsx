"use client";

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Chat from '../components/Chat';
import FileUpload from '../components/FileUpload';
import PlanManagement from '../components/PlanManagement';

export default function DashboardPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('chat');
  const [user, setUser] = useState<{
    id: number;
    name: string;
    email: string;
    plan?: {
      name: string;
      features: Record<string, unknown>;
    };
  } | null>(null);

  useEffect(() => {
    if (status === 'loading') return;
    if (!session) {
      router.push('/');
      return;
    }
  }, [session, status, router]);

  const tabs = [
    { id: 'chat', name: 'AI Assistant', icon: '💬' },
    { id: 'files', name: 'File Upload', icon: '📁' },
    { id: 'plan', name: 'Plan Management', icon: '⚙️' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Tab Navigation */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  activeTab === tab.id
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span>{tab.icon}</span>
                <span>{tab.name}</span>
              </button>
            ))}
          </nav>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {activeTab === 'chat' && (
            <>
              <div className="lg:col-span-2">
                <Chat />
              </div>
              <div className="space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                  <div className="space-y-3">
                    <button
                      onClick={() => setActiveTab('files')}
                      className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium">📁 Upload Files</div>
                      <div className="text-sm text-gray-500">Add documents for AI context</div>
                    </button>
                    <button
                      onClick={() => setActiveTab('plan')}
                      className="w-full text-left p-3 rounded-lg border hover:bg-gray-50 transition-colors"
                    >
                      <div className="font-medium">⚙️ Manage Plan</div>
                      <div className="text-sm text-gray-500">View and upgrade your plan</div>
                    </button>
                  </div>
                </div>
                
                <div className="bg-white rounded-lg shadow p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Your Plan</h3>
                  <div className="text-sm">
                    <div className="flex justify-between mb-2">
                      <span>Current Plan:</span>
                      <span className="font-medium">{user?.plan?.name || 'Free'}</span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>AI Agent:</span>
                      <span className={user?.plan?.features?.ai_agent ? 'text-green-600' : 'text-red-600'}>
                        {user?.plan?.features?.ai_agent ? '✓' : '✗'}
                      </span>
                    </div>
                    <div className="flex justify-between mb-2">
                      <span>File Upload:</span>
                      <span className={user?.plan?.features?.file_upload ? 'text-green-600' : 'text-red-600'}>
                        {user?.plan?.features?.file_upload ? '✓' : '✗'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}

          {activeTab === 'files' && (
            <div className="lg:col-span-3">
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-6">File Upload</h2>
                <FileUpload />
              </div>
            </div>
          )}

          {activeTab === 'plan' && (
            <div className="lg:col-span-3">
              <PlanManagement />
            </div>
          )}
        </div>
      </main>
    </div>
  );
} 