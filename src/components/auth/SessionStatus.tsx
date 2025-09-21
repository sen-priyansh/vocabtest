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

export default function SessionStatus() {
  const { user, isRemembered, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
        <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse"></div>
        <span className="text-xs">Loading...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="flex items-center space-x-2 text-gray-500 dark:text-gray-400">
        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
        <span className="text-xs">Not signed in</span>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-2">
      <div className={`w-2 h-2 rounded-full ${
        isRemembered ? 'bg-green-500' : 'bg-yellow-500'
      }`}></div>
      <span className="text-xs text-gray-600 dark:text-gray-300">
        {isRemembered ? 'Remembered' : 'Session only'}
      </span>
    </div>
  );
}