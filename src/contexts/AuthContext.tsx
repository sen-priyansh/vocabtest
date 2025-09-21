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

import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, Session, AuthError } from '@supabase/supabase-js';
import { supabase, Profile } from '@/lib/supabase';
import { AuthCache, CACHE_KEYS } from '@/lib/authCache';

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  session: Session | null;
  loading: boolean;
  isRemembered: boolean;
  signUp: (email: string, password: string, fullName: string) => Promise<{ error: AuthError | null }>;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: AuthError | null }>;
  signOut: () => Promise<{ error: AuthError | null }>;
  updateProfile: (updates: Partial<Profile>) => Promise<{ error: Error | null }>;
  clearCache: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isRemembered, setIsRemembered] = useState(false);

  // Clear cache utility
  const clearCache = () => {
    AuthCache.clear();
    setIsRemembered(false);
  };

  // Cache profile data when it changes
  useEffect(() => {
    if (profile && isRemembered) {
      AuthCache.setUserProfile(profile);
    }
  }, [profile, isRemembered]);

  // Cache session info when it changes
  useEffect(() => {
    if (session && isRemembered) {
      AuthCache.setUserSession(session, isRemembered);
    }
  }, [session, isRemembered]);

  useEffect(() => {
    // Check if user wants to be remembered
    const remembered = AuthCache.isRemembered();
    if (remembered) {
      setIsRemembered(true);
      // Load cached profile if available
      const cachedProfile = AuthCache.getUserProfile() as Profile | null;
      if (cachedProfile) {
        setProfile(cachedProfile);
      }
    }

    // Get initial session
    const getInitialSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setSession(session);
      setUser(session?.user ?? null);
      
      // Don't block loading on profile fetch - do it in background
      if (session?.user) {
        fetchProfile(session.user.id).catch(error => {
          console.warn('Profile fetch failed during initialization:', error);
        });
      } else if (!remembered) {
        // Clear cache if no session and not remembered
        clearCache();
      }
      
      setLoading(false);
    };

    getInitialSession();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      
      // Don't block auth state changes on profile fetch
      if (session?.user) {
        fetchProfile(session.user.id).catch(error => {
          console.warn('Profile fetch failed during auth change:', error);
        });
      } else {
        setProfile(null);
        if (!isRemembered) {
          clearCache();
        }
      }
      
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      // Simple profile fetch with fallback
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (data) {
        setProfile(data);
        return;
      }

      // If no profile exists, create a minimal one from auth user data
      if (error?.code === 'PGRST116') {
        console.log('No profile found, creating fallback...');
        
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          const fallbackProfile: Profile = {
            id: userId,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            avatar_url: user.user_metadata?.avatar_url || '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          setProfile(fallbackProfile);
          
          // Try to save to database in background (don't await)
          (async () => {
            try {
              await supabase
                .from('profiles')
                .insert(fallbackProfile);
              console.log('Profile created successfully');
            } catch (err) {
              console.warn('Could not save profile to database:', err);
            }
          })();
        }
        return;
      }

      console.warn('Profile fetch error:', error);
      
    } catch (error) {
      console.error('Unexpected error in fetchProfile:', error);
      
      // Always provide a fallback profile to prevent app crashes
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setProfile({
            id: userId,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || '',
            avatar_url: '',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });
        }
      } catch (fallbackError) {
        console.error('Even fallback profile creation failed:', fallbackError);
      }
    }
  };

  // Enhanced profile creation with better error handling
  const ensureUserProfileExists = async (user: User, fullName: string, email: string) => {
    try {
      // First check if profile already exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();

      if (existingProfile) {
        console.log('Profile already exists');
        return;
      }

      // Try to create profile using the safe function
      const { error } = await supabase.rpc('safe_create_user', {
        user_id: user.id,
        user_email: email,
        user_name: fullName
      });

      if (error) {
        console.warn('RPC safe_create_user failed, trying direct insert:', error);
        
        // Fallback to direct insert
        await supabase
          .from('profiles')
          .insert([{
            id: user.id,
            email: email,
            full_name: fullName
          }]);

        await supabase
          .from('user_stats')
          .insert([{
            user_id: user.id
          }]);
      }

      console.log('User profile ensured successfully');
    } catch (error) {
      console.warn('Could not ensure user profile exists:', error);
      // Don't throw - let the app continue
    }
  };

  const signUp = async (email: string, password: string, fullName: string) => {
    try {
      // Enhanced signup with better error handling
      const { data, error } = await supabase.auth.signUp({
        email: email.trim().toLowerCase(), // Normalize email
        password,
        options: {
          data: {
            full_name: fullName.trim(),
          },
          emailRedirectTo: `${window.location.origin}/auth/callback`
        },
      });

      if (error) {
        console.error('Signup error details:', error);
        
        // Handle specific error cases
        if (error.message.includes('Database error')) {
          console.log('Attempting fallback signup method...');
          
          // Try a simpler signup without metadata
          const { data: fallbackData, error: fallbackError } = await supabase.auth.signUp({
            email: email.trim().toLowerCase(),
            password,
          });
          
          if (fallbackError) {
            console.error('Fallback signup also failed:', fallbackError);
            return { error: fallbackError };
          }
          
          // If fallback worked, manually create profile
          if (fallbackData.user) {
            await ensureUserProfileExists(fallbackData.user, fullName.trim(), email.trim().toLowerCase());
          }
          
          return { error: null };
        }
        
        return { error };
      }

      console.log('Signup successful:', data);
      
      // Ensure profile exists even if trigger fails
      if (data.user) {
        await ensureUserProfileExists(data.user, fullName.trim(), email.trim().toLowerCase());
      }
      
      return { error: null };
    } catch (error) {
      console.error('Unexpected signup error:', error);
      return { error: error as AuthError };
    }
  };

  const signIn = async (email: string, password: string, rememberMe: boolean = false) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim().toLowerCase(), // Normalize email
        password,
      });

      if (!error) {
        // Set remember preference
        setIsRemembered(rememberMe);
        AuthCache.set(CACHE_KEYS.AUTH_REMEMBER, rememberMe);
        
        if (!rememberMe) {
          // Clear cache if not remembering
          AuthCache.clear();
        }
      }

      return { error };
    } catch (error) {
      console.error('Error signing in:', error);
      return { error: error as AuthError };
    }
  };

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      
      if (!error) {
        // Clear all cached data on sign out
        clearCache();
        setProfile(null);
        setUser(null);
        setSession(null);
      }
      
      return { error };
    } catch (error) {
      console.error('Error signing out:', error);
      return { error: error as AuthError };
    }
  };

  const updateProfile = async (updates: Partial<Profile>) => {
    if (!user) {
      return { error: new Error('No user logged in') };
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        return { error };
      }

      if (data) {
        setProfile(data);
      }

      return { error: null };
    } catch (error) {
      console.error('Error updating profile:', error);
      return { error: error instanceof Error ? error : new Error('Unknown error') };
    }
  };

  const value = {
    user,
    profile,
    session,
    loading,
    isRemembered,
    signUp,
    signIn,
    signOut,
    updateProfile,
    clearCache,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;