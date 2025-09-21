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
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import Header from '@/components/Header';
import { 
  useTestState, 
  selectRandomWords, 
  createMultipleChoiceOptions,
  Word 
} from '../hooks/useVocabTest';

function TestContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const difficulty = searchParams.get('difficulty') || 'all';
  
  const [words, setWords] = useState<Word[]>([]);
  const [currentOptions, setCurrentOptions] = useState<string[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showAnswer, setShowAnswer] = useState(false);
  const [isAnswerCorrect, setIsAnswerCorrect] = useState(false);
  const [showExample, setShowExample] = useState(false);
  const [loading, setLoading] = useState(true);

  const { 
    testState, 
    initializeTest, 
    recordAnswer, 
    nextQuestion, 
    updateTestState 
  } = useTestState();

  // Load words and initialize test
  useEffect(() => {
    const loadWords = async () => {
      try {
        const response = await fetch('/words.json');
        const allWords: Word[] = await response.json();
        setWords(allWords);

        // If no test state exists, initialize new test
        if (!testState) {
          const selectedWords = selectRandomWords(allWords, 20, difficulty);
          initializeTest(selectedWords);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error loading words:', error);
        setLoading(false);
      }
    };

    loadWords();
  }, []);

  // Generate options when current word changes
  useEffect(() => {
    if (testState && words.length > 0) {
      const currentWord = testState.selectedWords[testState.currentQuestionIndex];
      if (currentWord) {
        const options = createMultipleChoiceOptions(currentWord, words);
        setCurrentOptions(options);
      }
    }
  }, [testState?.currentQuestionIndex, words, testState?.selectedWords]);

  const handleAnswerSelect = (answer: string) => {
    if (showAnswer) return; // Prevent changing answer after showing result

    setSelectedAnswer(answer);
    
    const currentWord = testState?.selectedWords[testState.currentQuestionIndex];
    if (currentWord) {
      const correct = answer === currentWord.meaning;
      setIsAnswerCorrect(correct);
      setShowAnswer(true);
      
      // Record the answer
      recordAnswer(testState.currentQuestionIndex, answer, correct);
    }
  };

  const handleNextQuestion = () => {
    const isLastQuestion = testState && testState.currentQuestionIndex >= testState.selectedWords.length - 1;
    
    if (isLastQuestion) {
      // Test completed, go to results
      router.push('/result');
    } else {
      // Reset state for next question
      setSelectedAnswer('');
      setShowAnswer(false);
      setIsAnswerCorrect(false);
      setShowExample(false);
      nextQuestion();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading test...</p>
        </div>
      </div>
    );
  }

  if (!testState) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto p-8">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">Test Error</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">Unable to load test. Please try again.</p>
          <Link 
            href="/"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-6 rounded-xl transition-colors"
          >
            Back to Home
          </Link>
        </div>
      </div>
    );
  }

  const currentWord = testState.selectedWords[testState.currentQuestionIndex];
  const progress = ((testState.currentQuestionIndex + 1) / testState.selectedWords.length) * 100;
  const isLastQuestion = testState.currentQuestionIndex >= testState.selectedWords.length - 1;

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900">
        <div className="container mx-auto px-4 py-8 max-w-2xl">
          {/* Header */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-6 mb-6">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">VocabTest</h1>
            <Link 
              href="/"
              className="text-indigo-600 hover:text-indigo-800 font-medium"
            >
              Exit Test
            </Link>
          </div>
          
          {/* Progress Bar */}
          <div className="mb-4">
            <div className="flex justify-between text-sm text-gray-600 dark:text-gray-300 mb-2">
              <span>Question {testState.currentQuestionIndex + 1} of {testState.selectedWords.length}</span>
              <span>Score: {testState.score}/{testState.currentQuestionIndex + (showAnswer ? 1 : 0)}</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
              <div 
                className="bg-indigo-600 h-3 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8">
          {/* Word */}
          <div className="text-center mb-8">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 dark:text-white mb-4">
              {currentWord.word}
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-lg">
              Choose the correct meaning:
            </p>
          </div>

          {/* Options */}
          <div className="space-y-4 mb-8">
            {currentOptions.map((option, index) => {
              let buttonClass = "w-full p-4 text-left rounded-xl border-2 transition-all duration-200 ";
              
              if (!showAnswer) {
                buttonClass += selectedAnswer === option 
                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20" 
                  : "border-gray-200 dark:border-gray-600 hover:border-indigo-300 hover:bg-gray-50 dark:hover:bg-gray-700";
              } else {
                if (option === currentWord.meaning) {
                  buttonClass += "border-green-500 bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-200";
                } else if (option === selectedAnswer && option !== currentWord.meaning) {
                  buttonClass += "border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200";
                } else {
                  buttonClass += "border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700";
                }
              }

              return (
                <button
                  key={index}
                  onClick={() => handleAnswerSelect(option)}
                  disabled={showAnswer}
                  className={buttonClass}
                >
                  <span className="font-medium">{String.fromCharCode(65 + index)}</span>
                  <span className="ml-3">{option}</span>
                  {showAnswer && option === currentWord.meaning && (
                    <span className="ml-2 text-green-600">✓</span>
                  )}
                  {showAnswer && option === selectedAnswer && option !== currentWord.meaning && (
                    <span className="ml-2 text-red-600">✗</span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Example Sentence */}
          {showAnswer && (
            <div className="mb-6">
              <button
                onClick={() => setShowExample(!showExample)}
                className="text-indigo-600 hover:text-indigo-800 font-medium mb-3"
              >
                {showExample ? 'Hide' : 'Show'} Example Sentence
              </button>
              {showExample && (
                <div className="bg-gray-50 dark:bg-gray-700 rounded-xl p-4">
                  <p className="text-gray-700 dark:text-gray-300 italic">
                    &ldquo;{currentWord.example}&rdquo;
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Next Button */}
          {showAnswer && (
            <div className="text-center">
              <button
                onClick={handleNextQuestion}
                className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold py-3 px-8 rounded-xl text-lg transition-all duration-200 hover:scale-105"
              >
                {isLastQuestion ? 'View Results' : 'Next Question'}
              </button>
            </div>
          )}
        </div>
      </div>
      </div>
    </>
  );
}

export default function TestPage() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-blue-900 flex items-center justify-center">
          <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 dark:text-gray-300 mt-4">Loading test...</p>
          </div>
        </div>
      </>
    }>
      <TestContent />
    </Suspense>
  );
}