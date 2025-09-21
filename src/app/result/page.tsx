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

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { useTestState } from '../hooks/useVocabTest';
import { useTestResults } from '../hooks/useTestResults';
import { useAuth } from '@/contexts/AuthContext';

function ResultContent() {
  const { testState, resetTest } = useTestState();
  const { saveTestResult } = useTestResults();
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const difficulty = searchParams.get('difficulty') || 'all';
  const [showDetailed, setShowDetailed] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // If no test state, redirect to home
    if (!testState) {
      window.location.href = '/';
      return;
    }

    // Save test result to Supabase if user is logged in
    const saveResult = async () => {
      if (user && testState && !saving) {
        setSaving(true);
        try {
          await saveTestResult(testState, difficulty);
        } catch (error) {
          console.error('Error saving test result:', error);
        } finally {
          setSaving(false);
        }
      }
    };

    saveResult();
  }, [testState, user, difficulty, saveTestResult, saving]);

  if (!testState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading results...</p>
        </div>
      </div>
    );
  }

  const totalQuestions = testState.selectedWords.length;
  const score = testState.score;
  const percentage = Math.round((score / totalQuestions) * 100);
  const timeTaken = Math.round((Date.now() - testState.startTime) / 1000 / 60); // in minutes

  // Get performance message
  const getPerformanceMessage = (percentage: number) => {
    if (percentage >= 90) return { emoji: '🏆', message: 'Outstanding!', color: 'text-yellow-600' };
    if (percentage >= 80) return { emoji: '🎉', message: 'Excellent!', color: 'text-green-600' };
    if (percentage >= 70) return { emoji: '👏', message: 'Great job!', color: 'text-blue-600' };
    if (percentage >= 60) return { emoji: '👍', message: 'Good work!', color: 'text-indigo-600' };
    if (percentage >= 50) return { emoji: '📚', message: 'Keep learning!', color: 'text-purple-600' };
    return { emoji: '💪', message: 'Practice makes perfect!', color: 'text-red-600' };
  };

  const performance = getPerformanceMessage(percentage);

  const handleRetakeTest = () => {
    resetTest();
    window.location.href = '/';
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Main Results Card */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center mb-6">
            <div className="mb-8">
              <div className="text-8xl mb-4">{performance.emoji}</div>
              <h1 className={`text-4xl font-bold mb-2 ${performance.color}`}>
              {performance.message}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 text-lg">
              You completed the vocabulary test!
            </p>
          </div>

          {/* Score Display */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl p-6 text-white">
              <div className="text-3xl font-bold">{score}</div>
              <div className="text-indigo-100">Correct Answers</div>
            </div>
            <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-2xl p-6 text-white">
              <div className="text-3xl font-bold">{percentage}%</div>
              <div className="text-green-100">Accuracy</div>
            </div>
            <div className="bg-gradient-to-br from-blue-500 to-cyan-600 rounded-2xl p-6 text-white">
              <div className="text-3xl font-bold">{timeTaken}</div>
              <div className="text-blue-100">Minutes</div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-4">
            {/* Saving indicator */}
            {user && saving && (
              <div className="bg-blue-50 dark:bg-blue-900 border border-blue-200 dark:border-blue-700 rounded-xl p-4 text-center">
                <div className="flex items-center justify-center space-x-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-600"></div>
                  <span className="text-blue-600 dark:text-blue-300">Saving your results...</span>
                </div>
              </div>
            )}
            
            {/* Results saved confirmation */}
            {user && !saving && (
              <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-xl p-4 text-center">
                <span className="text-green-600 dark:text-green-300">✅ Results saved to your profile!</span>
              </div>
            )}
            
            <button
              onClick={handleRetakeTest}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-4 px-8 rounded-xl text-xl transition-all duration-200 hover:scale-105"
            >
              Retake Test
            </button>
            <div className="flex gap-4">
              <Link 
                href="/"
                className="flex-1 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 font-semibold py-3 px-6 rounded-xl transition-colors text-center"
              >
                Home
              </Link>
              {user && (
                <Link 
                  href="/dashboard"
                  className="flex-1 bg-green-200 hover:bg-green-300 dark:bg-green-800 dark:hover:bg-green-700 text-green-800 dark:text-green-200 font-semibold py-3 px-6 rounded-xl transition-colors text-center"
                >
                  Dashboard
                </Link>
              )}
              <button
                onClick={() => setShowDetailed(!showDetailed)}
                className="flex-1 bg-blue-200 hover:bg-blue-300 dark:bg-blue-800 dark:hover:bg-blue-700 text-blue-800 dark:text-blue-200 font-semibold py-3 px-6 rounded-xl transition-colors"
              >
                {showDetailed ? 'Hide' : 'Show'} Details
              </button>
            </div>
          </div>
        </div>

        {/* Detailed Results */}
        {showDetailed && (
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">Detailed Results</h2>
            
            <div className="space-y-4">
              {testState.selectedWords.map((word, index) => {
                const userAnswer = testState.answers.find(a => a.questionIndex === index);
                const isCorrect = userAnswer?.correct ?? false;
                
                return (
                  <div 
                    key={index}
                    className={`p-4 rounded-xl border-2 ${
                      isCorrect 
                        ? 'border-green-200 bg-green-50 dark:border-green-800 dark:bg-green-900/20' 
                        : 'border-red-200 bg-red-50 dark:border-red-800 dark:bg-red-900/20'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="font-semibold text-gray-700 dark:text-gray-300">
                          {index + 1}. {word.word}
                        </span>
                        <span className={`ml-2 ${isCorrect ? 'text-green-600' : 'text-red-600'}`}>
                          {isCorrect ? '✓' : '✗'}
                        </span>
                      </div>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        word.difficulty === 'easy' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        word.difficulty === 'medium' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {word.difficulty}
                      </span>
                    </div>
                    
                    <div className="text-sm space-y-1">
                      <div>
                        <span className="font-medium text-green-700 dark:text-green-300">Correct: </span>
                        <span className="text-gray-700 dark:text-gray-300">{word.meaning}</span>
                      </div>
                      {!isCorrect && userAnswer && (
                        <div>
                          <span className="font-medium text-red-700 dark:text-red-300">Your answer: </span>
                          <span className="text-gray-700 dark:text-gray-300">{userAnswer.selectedAnswer}</span>
                        </div>
                      )}
                      <div className="pt-2">
                        <span className="font-medium text-gray-600 dark:text-gray-400">Example: </span>
                        <span className="text-gray-600 dark:text-gray-400 italic">&ldquo;{word.example}&rdquo;</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Statistics */}
            <div className="mt-8 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <div className="text-2xl font-bold text-green-600">
                  {testState.answers.filter(a => a.correct).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Correct</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <div className="text-2xl font-bold text-red-600">
                  {testState.answers.filter(a => !a.correct).length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Incorrect</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <div className="text-2xl font-bold text-blue-600">
                  {testState.selectedWords.filter(w => w.difficulty === 'easy').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Easy</div>
              </div>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                <div className="text-2xl font-bold text-purple-600">
                  {testState.selectedWords.filter(w => w.difficulty === 'hard').length}
                </div>
                <div className="text-sm text-gray-600 dark:text-gray-400">Hard</div>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>
    </>
  );
}

export default function ResultPage() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-4">Loading results...</p>
          </div>
        </div>
      </>
    }>
      <ResultContent />
    </Suspense>
  );
}