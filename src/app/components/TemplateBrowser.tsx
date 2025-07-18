"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface Template {
  id: number;
  title: string;
  content: string;
  category: string;
  createdAt?: string; // Optional since API might not include it
}

interface TemplateBrowserProps {
  className?: string;
}

export default function TemplateBrowser({ className = '' }: TemplateBrowserProps) {
  const { data: session } = useSession();
  const [templates, setTemplates] = useState<Template[]>([]);
  const [filteredTemplates, setFilteredTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

  const categories = [
    { id: 'all', name: 'All Templates' },
    { id: 'hiring', name: 'Hiring' },
    { id: 'onboarding', name: 'Onboarding' },
    { id: 'termination', name: 'Termination' },
    { id: 'performance', name: 'Performance' },
    { id: 'policies', name: 'Policies' },
  ];

  useEffect(() => {
    const fetchTemplates = async () => {
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }

      try {
        // Get user ID
        const userResponse = await fetch(`/api/users?email=${session.user.email}`);
        if (!userResponse.ok) {
          throw new Error('Failed to get user information');
        }
        const userData = await userResponse.json();
        const userId = userData.user.id;

        // Fetch templates with user context for plan enforcement
        const response = await fetch(`/api/templates?userId=${userId}`);
        if (!response.ok) {
          throw new Error('Failed to fetch templates');
        }

        const data = await response.json();
        setTemplates(data.templates || []);
      } catch (error) {
        console.error('Error fetching templates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [session]);

  useEffect(() => {
    let filtered = templates;

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(template => template.category === selectedCategory);
    }

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(template =>
        template.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        template.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    setFilteredTemplates(filtered);
  }, [templates, selectedCategory, searchTerm]);

  const copyToClipboard = async (content: string) => {
    try {
      await navigator.clipboard.writeText(content);
      toast.success('Template copied to clipboard!');
    } catch (error) {
      toast.error('Failed to copy template');
    }
  };

  const formatDate = (dateString: string | undefined) => {
    return new Date(dateString || new Date()).toLocaleDateString();
  };

  if (!session) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center text-gray-600">
          Please log in to access HR templates.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="h-32 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow ${className}`}>
      {/* Header */}
      <div className="border-b p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">HR Templates</h2>
        
        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input
              type="text"
              placeholder="Search templates..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="flex-shrink-0">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="p-6">
        {filteredTemplates.length === 0 ? (
          <div className="text-center text-gray-500 py-8">
            <div className="text-2xl mb-2">📄</div>
            <p>No templates found matching your criteria.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((template) => (
              <div
                key={template.id}
                className="border rounded-lg p-4 hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedTemplate(template)}
              >
                <div className="flex justify-between items-start mb-2">
                  <h3 className="font-semibold text-gray-900">{template.title}</h3>
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                    {template.category}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3 line-clamp-3">
                  {template.content.substring(0, 150)}...
                </p>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-gray-500">
                    {formatDate(template.createdAt)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      copyToClipboard(template.content);
                    }}
                    className="text-xs bg-blue-600 text-white px-3 py-1 rounded hover:bg-blue-700 transition"
                  >
                    Copy
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Template Modal */}
      {selectedTemplate && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[80vh] overflow-hidden">
            <div className="border-b p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{selectedTemplate.title}</h3>
                  <p className="text-sm text-gray-500">
                    Category: {selectedTemplate.category} • Created: {formatDate(selectedTemplate.createdAt)}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              <pre className="whitespace-pre-wrap text-sm text-gray-700 bg-gray-50 p-4 rounded">
                {selectedTemplate.content}
              </pre>
            </div>
            <div className="border-t p-6">
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setSelectedTemplate(null)}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    copyToClipboard(selectedTemplate.content);
                    setSelectedTemplate(null);
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
                >
                  Copy Template
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 