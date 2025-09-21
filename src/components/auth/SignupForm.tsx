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
import { useAuth } from '@/contexts/AuthContext';

interface SignupFormProps {
  onSwitchToLogin: () => void;
  onClose?: () => void;
}

export default function SignupForm({ onSwitchToLogin, onClose }: SignupFormProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  
  const { signUp } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      setLoading(false);
      return;
    }

    // Normalize and validate email
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail.includes('@') || !normalizedEmail.includes('.')) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    const { error } = await signUp(normalizedEmail, password, fullName.trim());
    
    if (error) {
      let errorMessage = error.message;
      
      // Provide helpful error messages and suggestions
      if (error.message.includes('Database error')) {
        errorMessage = 'There was a temporary issue creating your account. Please try again with a different email address, or contact support if the problem persists.';
      } else if (error.message.includes('already registered')) {
        errorMessage = 'An account with this email already exists. Please try logging in instead.';
      } else if (error.message.includes('invalid')) {
        errorMessage = 'Please check your email format and try again.';
      }
      
      setError(errorMessage);
    } else {
      setSuccess(true);
      setTimeout(() => {
        onClose?.();
      }, 2000);
    }
    
    setLoading(false);
  };

  if (success) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md text-center">
        <div className="text-6xl mb-4">🎉</div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Welcome to VocabTest!
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Your account has been created successfully. You can now start tracking your vocabulary progress!
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-2xl p-8 w-full max-w-md">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Join VocabTest
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Create an account to track your progress and compete with friends
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl p-4">
            <p className="text-red-800 dark:text-red-200 text-sm">{error}</p>
          </div>
        )}

        <div>
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Full Name
          </label>
          <input
            id="fullName"
            type="text"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter your full name"
          />
        </div>

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Email Address
          </label>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            placeholder="Enter your email"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            Password
          </label>
          <div className="relative">
            <input
              id="password"
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              className="w-full px-4 py-3 pr-12 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
              placeholder="Create a password (min. 6 characters)"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 transition-colors"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
        >
          {loading ? 'Creating Account...' : 'Create Account'}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-gray-600 dark:text-gray-300">
          Already have an account?{' '}
          <button
            onClick={onSwitchToLogin}
            className="text-indigo-600 hover:text-indigo-700 font-medium"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}