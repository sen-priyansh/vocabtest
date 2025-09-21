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

import { useState, useEffect } from 'react';

export interface Word {
  word: string;
  meaning: string;
  example: string;
  difficulty: string;
}

export interface TestState {
  currentQuestionIndex: number;
  score: number;
  selectedWords: Word[];
  answers: { questionIndex: number; selectedAnswer: string; correct: boolean }[];
  startTime: number;
}

// Hook for localStorage management
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue;
    }
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore));
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  };

  const removeValue = () => {
    try {
      setStoredValue(initialValue);
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  };

  return [storedValue, setValue, removeValue] as const;
}

// Utility function to shuffle array
export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

// Function to select random words based on difficulty
export function selectRandomWords(
  words: Word[],
  count: number,
  difficulty: string = 'all'
): Word[] {
  let filteredWords = words;
  
  if (difficulty !== 'all') {
    filteredWords = words.filter(word => word.difficulty === difficulty);
  }
  
  if (filteredWords.length < count) {
    // If not enough words in the selected difficulty, use all words
    filteredWords = words;
  }
  
  return shuffleArray(filteredWords).slice(0, count);
}

// Function to generate wrong answers for multiple choice
export function generateWrongAnswers(
  correctWord: Word,
  allWords: Word[],
  count: number = 3
): string[] {
  const wrongWords = allWords.filter(word => word.word !== correctWord.word);
  const shuffledWrongWords = shuffleArray(wrongWords);
  return shuffledWrongWords.slice(0, count).map(word => word.meaning);
}

// Function to create multiple choice options
export function createMultipleChoiceOptions(
  correctWord: Word,
  allWords: Word[]
): string[] {
  const wrongAnswers = generateWrongAnswers(correctWord, allWords);
  const allOptions = [correctWord.meaning, ...wrongAnswers];
  return shuffleArray(allOptions);
}

// Hook for managing test state
export function useTestState() {
  const [testState, setTestState, clearTestState] = useLocalStorage<TestState | null>('vocabtest-state', null);

  const initializeTest = (words: Word[]) => {
    const newTestState: TestState = {
      currentQuestionIndex: 0,
      score: 0,
      selectedWords: words,
      answers: [],
      startTime: Date.now()
    };
    setTestState(newTestState);
  };

  const updateTestState = (updates: Partial<TestState>) => {
    if (testState) {
      setTestState({ ...testState, ...updates });
    }
  };

  const recordAnswer = (questionIndex: number, selectedAnswer: string, correct: boolean) => {
    if (testState) {
      const newAnswer = { questionIndex, selectedAnswer, correct };
      const updatedAnswers = [...testState.answers];
      
      // Replace if answer already exists for this question, otherwise add
      const existingIndex = updatedAnswers.findIndex(a => a.questionIndex === questionIndex);
      if (existingIndex >= 0) {
        updatedAnswers[existingIndex] = newAnswer;
      } else {
        updatedAnswers.push(newAnswer);
      }

      updateTestState({
        answers: updatedAnswers,
        score: correct ? testState.score + 1 : testState.score
      });
    }
  };

  const nextQuestion = () => {
    if (testState && testState.currentQuestionIndex < testState.selectedWords.length - 1) {
      updateTestState({ currentQuestionIndex: testState.currentQuestionIndex + 1 });
    }
  };

  const resetTest = () => {
    clearTestState();
  };

  return {
    testState,
    initializeTest,
    updateTestState,
    recordAnswer,
    nextQuestion,
    resetTest
  };
}