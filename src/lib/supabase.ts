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

import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL environment variable');
}

if (!supabaseAnonKey) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_ANON_KEY environment variable');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Database types
export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      test_results: {
        Row: {
          id: string;
          user_id: string;
          score: number;
          total_questions: number;
          difficulty: string;
          time_taken_seconds: number;
          words_tested: string[]; // JSON array of word IDs
          answers: Record<string, unknown>; // JSON object with detailed answers
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          score: number;
          total_questions: number;
          difficulty: string;
          time_taken_seconds: number;
          words_tested: string[];
          answers: Record<string, unknown>;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          score?: number;
          total_questions?: number;
          difficulty?: string;
          time_taken_seconds?: number;
          words_tested?: string[];
          answers?: Record<string, unknown>;
          created_at?: string;
        };
      };
      user_stats: {
        Row: {
          id: string;
          user_id: string;
          total_tests: number;
          total_score: number;
          total_questions: number;
          average_accuracy: number;
          best_score: number;
          favorite_difficulty: string | null;
          total_time_spent: number;
          streak_days: number;
          last_test_date: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          total_tests?: number;
          total_score?: number;
          total_questions?: number;
          average_accuracy?: number;
          best_score?: number;
          favorite_difficulty?: string | null;
          total_time_spent?: number;
          streak_days?: number;
          last_test_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          total_tests?: number;
          total_score?: number;
          total_questions?: number;
          average_accuracy?: number;
          best_score?: number;
          favorite_difficulty?: string | null;
          total_time_spent?: number;
          streak_days?: number;
          last_test_date?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Profile = Database['public']['Tables']['profiles']['Row'];
export type TestResult = Database['public']['Tables']['test_results']['Row'];
export type UserStats = Database['public']['Tables']['user_stats']['Row'];