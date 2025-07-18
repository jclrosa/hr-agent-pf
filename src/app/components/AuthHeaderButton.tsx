"use client";
import Link from "next/link";
import { useSession, signIn, signOut } from "next-auth/react";

export default function AuthHeaderButton() {
  const { data: session, status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex gap-4 items-center">
        <div className="animate-pulse bg-gray-200 h-8 w-20 rounded"></div>
      </div>
    );
  }

  const isAuthenticated = !!session;

  return (
    <div className="flex gap-4 items-center">
      {isAuthenticated && (
        <Link
          href="/dashboard"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
        >
          Dashboard
        </Link>
      )}
      {isAuthenticated ? (
        <button
          className="bg-gray-200 hover:bg-gray-300 text-gray-800 font-semibold py-2 px-4 rounded transition"
          onClick={() => signOut({ callbackUrl: "/" })}
        >
          Logout
        </button>
      ) : (
        <button
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded transition"
          onClick={() => signIn(undefined, { callbackUrl: "/dashboard" })}
        >
          Login
        </button>
      )}
    </div>
  );
} 