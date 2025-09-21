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

import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
      <div className="container mx-auto px-4 py-8 max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              📚 VocabTest
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              Test your vocabulary with challenging English words
            </p>
          </div>

          {/* Difficulty Selection */}
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200 mb-4">
              Choose Difficulty
            </h3>
            <div className="space-y-3">
              {[
                { value: 'all', label: 'All Levels', color: 'bg-blue-500' },
                { value: 'easy', label: 'Easy', color: 'bg-green-500' },
                { value: 'medium', label: 'Medium', color: 'bg-yellow-500' },
                { value: 'hard', label: 'Hard', color: 'bg-red-500' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setSelectedDifficulty(option.value)}
                  className={`w-full py-3 px-6 rounded-xl text-white font-medium transition-all duration-200 ${
                    selectedDifficulty === option.value 
                      ? `${option.color} shadow-lg scale-105` 
                      : 'bg-gray-400 hover:bg-gray-500'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Start Button */}
          <Link 
            href={`/test?difficulty=${selectedDifficulty}`}
            className="inline-block w-full"
          >
            <button className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-200 hover:scale-105 shadow-lg">
              Start Test
            </button>
          </Link>

          {/* Info */}
          <div className="mt-8 text-gray-500 dark:text-gray-400 text-sm">
            <p>📝 20 questions per test</p>
            <p>🎯 Multiple choice format</p>
            <p>💾 Progress saved automatically</p>
          </div>
        </div>
      </div>
    </div>
  );
}