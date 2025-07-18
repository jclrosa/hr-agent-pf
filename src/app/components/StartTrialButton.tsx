"use client";
import { signIn } from "next-auth/react";

export default function StartTrialButton() {
  const handleStartTrial = async () => {
    try {
      await signIn(undefined, { callbackUrl: "/dashboard" });
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <button
      onClick={handleStartTrial}
      className="inline-block bg-white text-blue-700 font-bold px-8 py-3 rounded-full shadow hover:bg-blue-100 transition"
    >
      Start Free Trial
    </button>
  );
} 