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

      // Clean up old tests to keep only last 20
      await cleanupOldTests();

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

  const deleteAllTestHistory = async () => {
    if (!user) return false;

    try {
      console.log('Starting delete all test history for user:', user.id);
      
      // Delete all test results for the user
      const { error: deleteError } = await supabase
        .from('test_results')
        .delete()
        .eq('user_id', user.id);

      if (deleteError) {
        console.error('Error deleting test history:', deleteError);
        return false;
      }

      console.log('Successfully deleted test results, now resetting stats...');

      // Reset user statistics
      const { data: existingStats } = await supabase
        .from('user_stats')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (existingStats) {
        // Update existing stats to zero
        const { error: statsError } = await supabase
          .from('user_stats')
          .update({
            total_tests: 0,
            total_questions: 0,
            correct_answers: 0,
            accuracy_percentage: 0,
            average_score: 0,
            best_score: 0,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id);

        if (statsError) {
          console.error('Error resetting user stats:', statsError);
          return false;
        }
      } else {
        // Create new stats record
        const { error: statsError } = await supabase
          .from('user_stats')
          .insert({
            user_id: user.id,
            total_tests: 0,
            total_questions: 0,
            correct_answers: 0,
            accuracy_percentage: 0,
            average_score: 0,
            best_score: 0,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (statsError) {
          console.error('Error creating user stats:', statsError);
          return false;
        }
      }

      console.log('Successfully reset user statistics');
      return true;
    } catch (error) {
      console.error('Error in deleteAllTestHistory:', error);
      return false;
    }
  };

  const cleanupOldTests = async () => {
    if (!user) return false;

    try {
      // Get all tests for the user, ordered by creation date (newest first)
      const { data: allTests, error: fetchError } = await supabase
        .from('test_results')
        .select('id, created_at')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (fetchError) {
        console.error('Error fetching tests for cleanup:', fetchError);
        return false;
      }

      // If user has more than 20 tests, delete the oldest ones
      if (allTests && allTests.length > 20) {
        const testsToDelete = allTests.slice(20); // Keep first 20, delete the rest
        const idsToDelete = testsToDelete.map(test => test.id);

        const { error: deleteError } = await supabase
          .from('test_results')
          .delete()
          .in('id', idsToDelete);

        if (deleteError) {
          console.error('Error cleaning up old tests:', deleteError);
          return false;
        }

        console.log(`Cleaned up ${idsToDelete.length} old tests`);
      }

      return true;
    } catch (error) {
      console.error('Error in cleanupOldTests:', error);
      return false;
    }
  };

  return {
    saveTestResult,
    updateUserStats,
    getUserStats,
    getUserTestHistory,
    deleteAllTestHistory,
    cleanupOldTests
  };
}