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

// Cache management utilities for auth persistence

export const CACHE_KEYS = {
  USER_PROFILE: 'vocabtest_user_profile',
  AUTH_REMEMBER: 'vocabtest_remember_auth',
  LAST_SESSION: 'vocabtest_last_session',
  USER_PREFERENCES: 'vocabtest_user_preferences',
  TEST_HISTORY_CACHE: 'vocabtest_test_history',
  STATS_CACHE: 'vocabtest_stats_cache'
} as const;

import type { Session } from '@supabase/supabase-js';

export interface UserProfile {
  id: string;
  email: string;
  full_name?: string | null;
  avatar_url?: string | null;
  created_at: string;
  updated_at?: string;
}

export interface CacheConfig {
  expiry?: number; // in milliseconds
  compress?: boolean;
}

export class AuthCache {
  private static isClient = typeof window !== 'undefined';

  static set(key: string, data: unknown, config: CacheConfig = {}): boolean {
    if (!this.isClient) return false;
    
    try {
      const item = {
        data,
        timestamp: Date.now(),
        expiry: config.expiry ? Date.now() + config.expiry : null
      };
      
      localStorage.setItem(key, JSON.stringify(item));
      return true;
    } catch (error) {
      console.warn(`Failed to cache ${key}:`, error);
      return false;
    }
  }

  static get<T>(key: string): T | null {
    if (!this.isClient) return null;
    
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return null;
      
      const item = JSON.parse(cached);
      
      // Check expiry
      if (item.expiry && Date.now() > item.expiry) {
        this.remove(key);
        return null;
      }
      
      return item.data as T;
    } catch (error) {
      console.warn(`Failed to read cache ${key}:`, error);
      this.remove(key);
      return null;
    }
  }

  static remove(key: string): boolean {
    if (!this.isClient) return false;
    
    try {
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.warn(`Failed to remove cache ${key}:`, error);
      return false;
    }
  }

  static clear(): boolean {
    if (!this.isClient) return false;
    
    try {
      Object.values(CACHE_KEYS).forEach(key => {
        this.remove(key);
      });
      return true;
    } catch (error) {
      console.warn('Failed to clear all cache:', error);
      return false;
    }
  }

  static isExpired(key: string): boolean {
    if (!this.isClient) return true;
    
    try {
      const cached = localStorage.getItem(key);
      if (!cached) return true;
      
      const item = JSON.parse(cached);
      return item.expiry ? Date.now() > item.expiry : false;
    } catch {
      return true;
    }
  }

  static getSize(): number {
    if (!this.isClient) return 0;
    
    try {
      let total = 0;
      Object.values(CACHE_KEYS).forEach(key => {
        const item = localStorage.getItem(key);
        if (item) {
          total += item.length;
        }
      });
      return total;
    } catch {
      return 0;
    }
  }

  // Session-specific methods
  static setUserSession(session: Session | null, rememberMe: boolean = false) {
    const expiry = rememberMe ? 30 * 24 * 60 * 60 * 1000 : undefined; // 30 days if remembered
    this.set(CACHE_KEYS.LAST_SESSION, session, { expiry });
    this.set(CACHE_KEYS.AUTH_REMEMBER, rememberMe);
  }

  static getUserSession() {
    return this.get(CACHE_KEYS.LAST_SESSION);
  }

  static isRemembered(): boolean {
    return this.get(CACHE_KEYS.AUTH_REMEMBER) === true;
  }

  static setUserProfile(profile: UserProfile | null) {
    const expiry = this.isRemembered() ? 7 * 24 * 60 * 60 * 1000 : undefined; // 7 days if remembered
    this.set(CACHE_KEYS.USER_PROFILE, profile, { expiry });
  }

  static getUserProfile() {
    return this.get(CACHE_KEYS.USER_PROFILE);
  }
}

export default AuthCache;