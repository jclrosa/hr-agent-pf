"use client";

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { toast } from 'react-hot-toast';

interface User {
  id: number;
  email: string;
  name: string | null;
  company: string | null;
  planId: number | null;
  plan?: {
    id: number;
    name: string;
    price: number;
    features: any;
  };
  createdAt: string;
}

interface UserProfileProps {
  className?: string;
}

export default function UserProfile({ className = '' }: UserProfileProps) {
  const { data: session } = useSession();
  const [user, setUser] = useState<{
    id: number;
    name: string;
    email: string;
    plan?: {
      id: number;
      name: string;
      price: number;
      features: Record<string, unknown>;
    };
  } | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    company: '',
  });

  useEffect(() => {
    const fetchUserData = async () => {
      if (!session?.user?.email) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(`/api/users?email=${session.user.email}`);
        if (response.ok) {
          const data = await response.json();
          setUser(data.user);
          setFormData({
            name: data.user.name || '',
            company: data.user.company || '',
          });
        } else {
          setError('Failed to load user data');
        }
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [session]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSave = async () => {
    if (!user) return;

    setSaving(true);
    try {
      const response = await fetch(`/api/users`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: user.id,
          name: formData.name,
          company: formData.company,
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json() as {
          user: {
            id: number;
            name: string;
            email: string;
            plan?: {
              id: number;
              name: string;
              price: number;
              features: Record<string, unknown>;
            };
          };
        };
        setUser(updatedUser.user);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update profile');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      name: user?.name || '',
      company: user?.company || '',
    });
    setIsEditing(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const formatPrice = (price: number) => {
    if (price === 0) return 'Free';
    return `$${(price / 100).toFixed(2)}`;
  };

  if (!session) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="text-center text-gray-600">
          Please log in to view your profile.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className={`bg-white rounded-lg shadow p-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
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
        <div className="flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-900">Profile Settings</h2>
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* Profile Information */}
      <div className="p-6 space-y-6">
        {/* Account Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Account Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={user?.email || ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
              <p className="text-xs text-gray-500 mt-1">Email cannot be changed</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Member Since
              </label>
              <input
                type="text"
                value={user?.createdAt ? formatDate(user.createdAt) : ''}
                disabled
                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
              />
            </div>
          </div>
        </div>

        {/* Personal Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Personal Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your full name"
                />
              ) : (
                <input
                  type="text"
                  value={user?.name || 'Not provided'}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your company name"
                />
              ) : (
                <input
                  type="text"
                  value={user?.company || 'Not provided'}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50"
                />
              )}
            </div>
          </div>
        </div>

        {/* Plan Information */}
        <div>
          <h3 className="text-lg font-medium text-gray-900 mb-4">Current Plan</h3>
          <div className="bg-gray-50 rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Plan Name
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {user?.plan?.name || 'Free'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Price
                </label>
                <p className="text-lg font-semibold text-gray-900">
                  {user?.plan ? formatPrice(user.plan.price) : 'Free'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Active
                </span>
              </div>
            </div>
            
            {/* Plan Features */}
            {user?.plan?.features && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Plan Features
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  <div className="flex items-center">
                    <span className={`mr-2 ${user.plan.features.ai_agent ? 'text-green-600' : 'text-red-600'}`}>
                      {user.plan.features.ai_agent ? '✓' : '✗'}
                    </span>
                    <span className="text-sm">AI Agent Access</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`mr-2 ${user.plan.features.file_upload ? 'text-green-600' : 'text-red-600'}`}>
                      {user.plan.features.file_upload ? '✓' : '✗'}
                    </span>
                    <span className="text-sm">File Upload</span>
                  </div>
                  <div className="flex items-center">
                    <span className={`mr-2 ${user.plan.features.live_consultation ? 'text-green-600' : 'text-red-600'}`}>
                      {user.plan.features.live_consultation ? '✓' : '✗'}
                    </span>
                    <span className="text-sm">Live Consultation</span>
                  </div>
                  <div className="flex items-center">
                    <span className="mr-2 text-blue-600">📄</span>
                    <span className="text-sm">{user.plan.features.templates || 3} Templates</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              onClick={handleCancel}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
} 