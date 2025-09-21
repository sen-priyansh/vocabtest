/*
 * VocabTest - Vocabulary Testing Progressive Web App
 * Copyright (c) 2025 Priyansh Sen
 * 
 * Licensed under the VocabTest Community License (VCL) v1.0
 * See LICENSE file for terms and conditions
 * 
 * This file is part of VocabTest, a community-driven vocabulary learning application.
 * Commercial use is prohibited without explicit permission from the copyright holder.
 */

'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

interface UserMenuProps {
  onOpenAuth: (tab?: 'login' | 'signup') => void;
}

export default function UserMenu({ onOpenAuth }: UserMenuProps) {
  const { user, profile, signOut } = useAuth();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const router = useRouter();

  const handleSignOut = async () => {
    await signOut();
    setIsDropdownOpen(false);
  };

  if (!user) {
    return (
      <div className="flex items-center space-x-3">
        <button
          onClick={() => onOpenAuth('login')}
          className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-lg font-medium transition-colors"
        >
          Sign In
        </button>
        <button
          onClick={() => onOpenAuth('signup')}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-medium transition-colors"
        >
          Sign Up
        </button>
      </div>
    );
  }

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center space-x-2 bg-gray-700 hover:bg-gray-600 text-white px-3 py-2 rounded-lg transition-colors"
      >
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white font-medium">
          {profile?.full_name?.[0]?.toUpperCase() || user.email?.[0]?.toUpperCase()}
        </div>
        <span className="hidden sm:inline">{profile?.full_name || user.email}</span>
        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isDropdownOpen && (
        <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg py-2 z-10">
          <div className="px-4 py-2 border-b border-gray-200 dark:border-gray-700">
            <p className="text-sm font-medium text-gray-900 dark:text-white">
              {profile?.full_name || 'User'}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{user.email}</p>
          </div>
          
          <button
            onClick={() => {
              setIsDropdownOpen(false);
              router.push('/dashboard');
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Dashboard
          </button>
          
          <button
            onClick={() => {
              setIsDropdownOpen(false);
              router.push('/dashboard?tab=profile');
            }}
            className="w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Profile
          </button>
          
          <button
            onClick={handleSignOut}
            className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            Sign Out
          </button>
        </div>
      )}
    </div>
  );
}