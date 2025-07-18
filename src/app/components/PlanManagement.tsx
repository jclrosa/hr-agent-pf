"use client";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Link from "next/link";

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
}

export default function PlanManagement() {
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
  const [error, setError] = useState<string | null>(null);

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

  const currentPlan = user?.plan?.name || "Free";
  const planFeatures = {
    Free: ["3 Core HR Templates", "Template Download", "Basic Customization"],
    "Self-Serve": ["20+ HR Templates", "Full AI Agent Access", "File Upload & Processing", "Personalized Recommendations", "Email Support"],
    "Expert": ["Everything in Self-Serve", "5 Hours Live Consultation", "Custom HR Strategy", "Compliance Review", "Priority Support"],
    "Premium": ["Everything in Expert", "Custom Onboarding Design", "Team Training & Workshops", "HRIS Integration Support", "Dedicated Success Manager"]
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-200 rounded mb-4"></div>
          <div className="h-4 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded mb-6"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white rounded-lg shadow p-6">
        <div className="text-red-600">Error: {error}</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-start mb-6">
        <div>
          <h2 className="text-2xl font-bold text-blue-900 mb-2">Your Plan</h2>
          <p className="text-gray-600">Manage your subscription and access</p>
        </div>
        <div className="text-right">
          <div className="text-sm text-gray-500">Current Plan</div>
          <div className="text-lg font-semibold text-blue-600">{currentPlan}</div>
        </div>
      </div>

      {/* Current Plan Features */}
      <div className="mb-8">
        <h3 className="font-semibold text-blue-900 mb-3">Your Current Features</h3>
        <ul className="space-y-2">
          {planFeatures[currentPlan as keyof typeof planFeatures]?.map((feature, idx) => (
            <li key={idx} className="flex items-center text-sm">
              <span className="text-green-500 mr-2">✓</span>
              {feature}
            </li>
          ))}
        </ul>
      </div>

      {/* Upgrade Options */}
      <div className="border-t pt-6">
        <h3 className="font-semibold text-blue-900 mb-4">Upgrade Your Plan</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Self-Serve Platform</h4>
            <div className="text-2xl font-bold text-blue-600 mb-2">$99<span className="text-sm">/month</span></div>
            <p className="text-sm text-gray-600 mb-3">AI-powered HR guidance that scales with your team</p>
            <button className="w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition text-sm">
              Upgrade to Self-Serve
            </button>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Expert Consultation</h4>
            <div className="text-2xl font-bold text-blue-600 mb-2">$2,000</div>
            <p className="text-sm text-gray-600 mb-3">When you need expert guidance alongside powerful tools</p>
            <Link href="/consultation" className="block w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition text-sm text-center">
              Book Consultation
            </Link>
          </div>
          
          <div className="border rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Premium Service</h4>
            <div className="text-2xl font-bold text-blue-600 mb-2">$5,000</div>
            <p className="text-sm text-gray-600 mb-3">Full-service HR implementation and support</p>
            <Link href="/premium" className="block w-full bg-blue-600 text-white font-semibold py-2 px-4 rounded hover:bg-blue-700 transition text-sm text-center">
              Contact Sales
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
} 