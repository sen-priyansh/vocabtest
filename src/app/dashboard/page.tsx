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

import { useEffect, useState, useCallback, Suspense } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { supabase } from '@/lib/supabase';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';

interface UserStats {
  total_tests: number;
  total_questions: number;
  correct_answers: number;
  accuracy_percentage: number;
  average_score: number;
  best_score: number;
  created_at: string;
  updated_at: string;
}

interface TestResult {
  id: string;
  score: number;
  total_questions: number;
  difficulty: string;
  time_taken: number;
  created_at: string;
  answers?: Record<string, unknown>[];
}

interface ProgressData {
  date: string;
  score: number;
  accuracy: number;
}

export default function DashboardPage() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-4">Loading dashboard...</p>
          </div>
        </div>
      </>
    }>
      <DashboardContent />
    </Suspense>
  );
}

function DashboardContent() {
  const { user, profile } = useAuth();
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const [stats, setStats] = useState<UserStats | null>(null);
  const [recentTests, setRecentTests] = useState<TestResult[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'progress' | 'history' | 'profile'>('overview');

  // Set initial tab based on URL parameter
  useEffect(() => {
    if (tabParam && ['overview', 'progress', 'history', 'profile'].includes(tabParam)) {
      setActiveTab(tabParam as 'overview' | 'progress' | 'history' | 'profile');
    }
  }, [tabParam]);

  const loadUserData = useCallback(async () => {
    try {
      // Load user stats
      const { data: statsData } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user!.id)
        .single();
      
      setStats(statsData);

      // Load recent test results (expanded)
      const { data: testsData } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', user!.id)
        .order('created_at', { ascending: false })
        .limit(20);
      
      setRecentTests(testsData || []);

      // Generate progress data for charts
      if (testsData && testsData.length > 0) {
        const progressData = testsData
          .slice(-10) // Last 10 tests
          .map((test) => ({
            date: new Date(test.created_at).toLocaleDateString(),
            score: test.score,
            accuracy: Math.round((test.score / test.total_questions) * 100)
          }))
          .reverse(); // Show chronological order
        
        setProgressData(progressData);
      }

    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user, loadUserData]);

  if (!user) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center max-w-md">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Sign In Required
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Please sign in to view your dashboard and test statistics.
            </p>
            <Link
              href="/"
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
            >
              Go to Home
            </Link>
          </div>
        </div>
      </>
    );
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-4">Loading your dashboard...</p>
          </div>
        </div>
      </>
    );
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'text-green-600 bg-green-100 dark:bg-green-900 dark:text-green-300';
      case 'medium': return 'text-yellow-600 bg-yellow-100 dark:bg-yellow-900 dark:text-yellow-300';
      case 'hard': return 'text-red-600 bg-red-100 dark:bg-red-900 dark:text-red-300';
      default: return 'text-blue-600 bg-blue-100 dark:bg-blue-900 dark:text-blue-300';
    }
  };

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
        <div className="container mx-auto px-4 py-8 max-w-6xl">
          {/* Welcome Section */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 mb-6">
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome back, {profile?.full_name || 'User'}! 👋
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Track your vocabulary progress and view your test history.
            </p>
          </div>

          {/* Tab Navigation */}
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg mb-6">
            <div className="flex flex-wrap border-b border-gray-200 dark:border-gray-700">
              {[
                { id: 'overview', label: 'Overview', icon: '📊' },
                { id: 'progress', label: 'Progress', icon: '📈' },
                { id: 'history', label: 'Test History', icon: '📚' },
                { id: 'profile', label: 'Profile', icon: '👤' }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'overview' | 'progress' | 'history' | 'profile')}
                  className={`flex items-center space-x-2 px-6 py-4 font-medium transition-colors ${
                    activeTab === tab.id
                      ? 'text-blue-600 border-b-2 border-blue-600 bg-blue-50 dark:bg-blue-900/20'
                      : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
                  }`}
                >
                  <span>{tab.icon}</span>
                  <span>{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Stats Overview */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {stats?.total_tests || 0}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">Tests Taken</div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-green-600 mb-2">
                    {stats?.accuracy_percentage ? `${stats.accuracy_percentage.toFixed(1)}%` : '0%'}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">Accuracy</div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-purple-600 mb-2">
                    {stats?.average_score ? stats.average_score.toFixed(1) : '0'}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">Avg Score</div>
                </div>
                
                <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 text-center">
                  <div className="text-3xl font-bold text-orange-600 mb-2">
                    {stats?.best_score || 0}
                  </div>
                  <div className="text-gray-600 dark:text-gray-300">Best Score</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Link
                    href="/?difficulty=easy"
                    className="bg-green-100 hover:bg-green-200 dark:bg-green-900 dark:hover:bg-green-800 p-4 rounded-lg text-center transition-colors"
                  >
                    <div className="text-2xl mb-2">🟢</div>
                    <div className="font-medium text-green-800 dark:text-green-200">Easy Test</div>
                    <div className="text-sm text-green-600 dark:text-green-300">Basic vocabulary</div>
                  </Link>
                  
                  <Link
                    href="/?difficulty=medium"
                    className="bg-yellow-100 hover:bg-yellow-200 dark:bg-yellow-900 dark:hover:bg-yellow-800 p-4 rounded-lg text-center transition-colors"
                  >
                    <div className="text-2xl mb-2">🟡</div>
                    <div className="font-medium text-yellow-800 dark:text-yellow-200">Medium Test</div>
                    <div className="text-sm text-yellow-600 dark:text-yellow-300">Intermediate words</div>
                  </Link>
                  
                  <Link
                    href="/?difficulty=hard"
                    className="bg-red-100 hover:bg-red-200 dark:bg-red-900 dark:hover:bg-red-800 p-4 rounded-lg text-center transition-colors"
                  >
                    <div className="text-2xl mb-2">🔴</div>
                    <div className="font-medium text-red-800 dark:text-red-200">Hard Test</div>
                    <div className="text-sm text-red-600 dark:text-red-300">Advanced vocabulary</div>
                  </Link>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Recent Tests</h2>
                {recentTests.length === 0 ? (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📚</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No tests yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300 mb-6">
                      Start taking vocabulary tests to see your progress here.
                    </p>
                    <Link
                      href="/"
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors"
                    >
                      Take Your First Test
                    </Link>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {recentTests.slice(0, 5).map((test) => (
                      <div
                        key={test.id}
                        className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="text-2xl">
                            {test.score >= test.total_questions * 0.8 ? '🏆' : 
                             test.score >= test.total_questions * 0.6 ? '⭐' : '📝'}
                          </div>
                          <div>
                            <div className="font-semibold text-gray-900 dark:text-white">
                              Score: {test.score}/{test.total_questions}
                            </div>
                            <div className="text-sm text-gray-600 dark:text-gray-300">
                              {formatDate(test.created_at)}
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-3">
                          <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
                            {test.difficulty === 'all' ? 'All Levels' : test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1)}
                          </span>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {Math.round((test.score / test.total_questions) * 100)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'progress' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Progress Chart</h2>
                {progressData.length > 0 ? (
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Simple Progress Visualization */}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Last 10 Tests</h3>
                        <div className="space-y-2">
                          {progressData.map((data, index) => (
                            <div key={index} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                              <span className="text-sm text-gray-600 dark:text-gray-300">{data.date}</span>
                              <div className="flex items-center space-x-2">
                                <span className="text-sm font-medium">{data.score} pts</span>
                                <div className="w-20 bg-gray-200 dark:bg-gray-600 rounded-full h-2">
                                  <div 
                                    className="bg-blue-600 h-2 rounded-full" 
                                    style={{ width: `${data.accuracy}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600 dark:text-gray-300">{data.accuracy}%</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                      
                      {/* Performance Analysis */}
                      <div>
                        <h3 className="font-semibold text-gray-900 dark:text-white mb-3">Performance Analysis</h3>
                        <div className="space-y-4">
                          <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                            <div className="font-medium text-blue-800 dark:text-blue-200">Improvement Trend</div>
                            <div className="text-sm text-blue-600 dark:text-blue-300">
                              {progressData.length >= 2 ? (
                                progressData[progressData.length - 1].accuracy > progressData[0].accuracy ? 
                                '📈 Your accuracy is improving!' : 
                                progressData[progressData.length - 1].accuracy === progressData[0].accuracy ?
                                '📊 Your performance is consistent' :
                                '📉 Consider reviewing your study strategy'
                              ) : 'Take more tests to see trends'}
                            </div>
                          </div>
                          
                          <div className="p-4 bg-green-50 dark:bg-green-900/20 rounded-lg">
                            <div className="font-medium text-green-800 dark:text-green-200">Strong Areas</div>
                            <div className="text-sm text-green-600 dark:text-green-300">
                              {stats?.accuracy_percentage ? (
                                stats.accuracy_percentage >= 80 ? 'Excellent vocabulary knowledge!' :
                                stats.accuracy_percentage >= 60 ? 'Good foundation, keep practicing!' :
                                'Room for improvement - practice regularly'
                              ) : 'Take tests to identify strengths'}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-6xl mb-4">📈</div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                      No progress data yet
                    </h3>
                    <p className="text-gray-600 dark:text-gray-300">
                      Take a few tests to see your progress visualization.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'history' && (
            <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Complete Test History</h2>
              {recentTests.length === 0 ? (
                <div className="text-center py-8">
                  <div className="text-6xl mb-4">📚</div>
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                    No test history
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Your completed tests will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {recentTests.map((test) => (
                    <div
                      key={test.id}
                      className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center space-x-4">
                        <div className="text-2xl">
                          {test.score >= test.total_questions * 0.8 ? '🏆' : 
                           test.score >= test.total_questions * 0.6 ? '⭐' : '📝'}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900 dark:text-white">
                            Score: {test.score}/{test.total_questions} ({Math.round((test.score / test.total_questions) * 100)}%)
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {formatDate(test.created_at)} • {test.time_taken ? `${Math.floor(test.time_taken / 60)}:${(test.time_taken % 60).toString().padStart(2, '0')}` : 'N/A'}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center space-x-3">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getDifficultyColor(test.difficulty)}`}>
                          {test.difficulty === 'all' ? 'All Levels' : test.difficulty.charAt(0).toUpperCase() + test.difficulty.slice(1)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === 'profile' && (
            <div className="space-y-6">
              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Profile Information</h2>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Name
                    </label>
                    <div className="text-gray-900 dark:text-white">
                      {profile?.full_name || 'Not set'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Email
                    </label>
                    <div className="text-gray-900 dark:text-white">
                      {profile?.email || user?.email || 'Not available'}
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Member Since
                    </label>
                    <div className="text-gray-900 dark:text-white">
                      {profile?.created_at ? formatDate(profile.created_at) : 'Unknown'}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Account Statistics</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-blue-600">
                      {stats?.total_questions || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Questions Answered</div>
                  </div>
                  
                  <div className="text-center p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div className="text-2xl font-bold text-green-600">
                      {stats?.correct_answers || 0}
                    </div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Correct Answers</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}