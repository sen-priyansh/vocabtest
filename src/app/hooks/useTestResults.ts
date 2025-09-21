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

import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { TestState } from './useVocabTest';

export function useTestResults() {
  const { user } = useAuth();

  const saveTestResult = async (
    testState: TestState, 
    difficulty: string,
    endTime: number = Date.now()
  ) => {
    if (!user || !testState) return null;

    try {
      const timeTaken = Math.round((endTime - testState.startTime) / 1000); // in seconds
      
      // Save test result
      const { data: testResult, error: testError } = await supabase
        .from('test_results')
        .insert({
          user_id: user.id,
          score: testState.score,
          total_questions: testState.selectedWords.length,
          difficulty: difficulty,
          time_taken: timeTaken,
          answers: testState.answers
        })
        .select()
        .single();

      if (testError) {
        console.error('Error saving test result:', testError);
        return null;
      }

      // Update user statistics
      await updateUserStats(testState);

      return testResult;
    } catch (error) {
      console.error('Error in saveTestResult:', error);
      return null;
    }
  };

  const updateUserStats = async (testState: TestState) => {
    if (!user || !testState) return;

    try {
      // Get current stats or create new ones
      const { data: currentStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      const totalQuestions = testState.selectedWords.length;
      const correctAnswers = testState.score;
      
      if (currentStats) {
        // Update existing stats
        const newTotalTests = currentStats.total_tests + 1;
        const newTotalQuestions = currentStats.total_questions + totalQuestions;
        const newCorrectAnswers = currentStats.correct_answers + correctAnswers;
        const newAccuracy = (newCorrectAnswers / newTotalQuestions) * 100;
        const newAverageScore = newCorrectAnswers / newTotalTests;
        const newBestScore = Math.max(currentStats.best_score, correctAnswers);

        await supabase
          .from('user_stats')
          .update({
            total_tests: newTotalTests,
            total_questions: newTotalQuestions,
            correct_answers: newCorrectAnswers,
            accuracy_percentage: newAccuracy,
            average_score: newAverageScore,
            best_score: newBestScore,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);
      } else {
        // Create new stats
        const accuracy = (correctAnswers / totalQuestions) * 100;
        
        await supabase
          .from('user_stats')
          .insert({
            user_id: user.id,
            total_tests: 1,
            total_questions: totalQuestions,
            correct_answers: correctAnswers,
            accuracy_percentage: accuracy,
            average_score: correctAnswers,
            best_score: correctAnswers
          });
      }
    } catch (error) {
      console.error('Error updating user stats:', error);
    }
  };

  const getUserStats = async () => {
    if (!user) return null;

    try {
      const { data, error } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 is "not found"
        console.error('Error fetching user stats:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in getUserStats:', error);
      return null;
    }
  };

  const getUserTestHistory = async (limit = 10) => {
    if (!user) return [];

    try {
      const { data, error } = await supabase
        .from('test_results')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('Error fetching test history:', error);
        return [];
      }

      return data || [];
    } catch (error) {
      console.error('Error in getUserTestHistory:', error);
      return [];
    }
  };

  return {
    saveTestResult,
    updateUserStats,
    getUserStats,
    getUserTestHistory
  };
}