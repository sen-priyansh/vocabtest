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

import { useState } from 'react';
import Link from 'next/link';
import UserMenu from '@/components/auth/UserMenu';
import AuthModal from '@/components/auth/AuthModal';

export default function Header() {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authTab, setAuthTab] = useState<'login' | 'signup'>('login');

  const handleOpenAuth = (tab: 'login' | 'signup' = 'login') => {
    setAuthTab(tab);
    setIsAuthModalOpen(true);
  };

  return (
    <>
      <header className="bg-white dark:bg-gray-900 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Link href="/" className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                  <span className="text-white font-bold text-lg">V</span>
                </div>
                <span className="text-xl font-bold text-gray-900 dark:text-white">
                  VocabTest
                </span>
              </Link>
            </div>

            <nav className="hidden md:flex items-center space-x-8">
              <Link
                href="/"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Home
              </Link>
              <Link
                href="/dashboard"
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
              >
                Dashboard
              </Link>
            </nav>

            <div className="flex items-center">
              <UserMenu onOpenAuth={handleOpenAuth} />
            </div>
          </div>
        </div>
      </header>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        defaultTab={authTab}
      />
    </>
  );
}