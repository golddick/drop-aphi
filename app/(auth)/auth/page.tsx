"use client"

import { AuthTabs } from "@/modules/auth/auth-tabs"


export default function AuthPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black/5 to-black/10 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Welcome to DROPAPHI</h1>
          <p className="text-gray-600">Sign in to your account or create a new one</p>
        </div>
        <AuthTabs />
      </div>
    </div>
  )
}
