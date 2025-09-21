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

import { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultTab?: 'login' | 'signup';
}

export default function AuthModal({ isOpen, onClose, defaultTab = 'login' }: AuthModalProps) {
  const [activeTab, setActiveTab] = useState<'login' | 'signup'>(defaultTab);

  // Update active tab when defaultTab changes or modal opens
  useEffect(() => {
    if (isOpen) {
      setActiveTab(defaultTab);
    }
  }, [isOpen, defaultTab]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="relative max-w-md w-full">
        <button
          onClick={onClose}
          className="absolute -top-4 -right-4 bg-gray-700 hover:bg-gray-600 text-white rounded-full w-8 h-8 flex items-center justify-center text-xl z-10"
        >
          ×
        </button>
        
        {activeTab === 'login' ? (
          <LoginForm
            onSwitchToSignup={() => setActiveTab('signup')}
            onClose={onClose}
          />
        ) : (
          <SignupForm
            onSwitchToLogin={() => setActiveTab('login')}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}