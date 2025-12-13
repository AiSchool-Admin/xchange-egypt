'use client';

import React, { useState, useEffect, useCallback } from 'react';

interface VoiceSearchProps {
  onResult: (text: string) => void;
  onListening?: (isListening: boolean) => void;
  language?: string;
  placeholder?: string;
  className?: string;
}

declare global {
  interface Window {
    webkitSpeechRecognition: any;
    SpeechRecognition: any;
  }
}

export default function VoiceSearch({
  onResult,
  onListening,
  language = 'ar-EG',
  placeholder = 'اضغط للبحث الصوتي...',
  className = '',
}: VoiceSearchProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [isSupported, setIsSupported] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    // Check if speech recognition is supported
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        setIsSupported(true);
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = language;

        recognitionInstance.onresult = (event: any) => {
          const current = event.resultIndex;
          const result = event.results[current];
          const text = result[0].transcript;
          setTranscript(text);

          if (result.isFinal) {
            onResult(text);
          }
        };

        recognitionInstance.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setError(getErrorMessage(event.error));
          setIsListening(false);
          onListening?.(false);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
          onListening?.(false);
        };

        setRecognition(recognitionInstance);
      }
    }
  }, [language, onResult, onListening]);

  const getErrorMessage = (error: string): string => {
    switch (error) {
      case 'not-allowed':
        return 'يرجى السماح بالوصول إلى الميكروفون';
      case 'no-speech':
        return 'لم يتم اكتشاف أي كلام';
      case 'audio-capture':
        return 'لا يوجد ميكروفون متاح';
      case 'network':
        return 'خطأ في الشبكة';
      default:
        return 'حدث خطأ أثناء التعرف على الصوت';
    }
  };

  const toggleListening = useCallback(() => {
    if (!recognition) return;

    if (isListening) {
      recognition.stop();
    } else {
      setTranscript('');
      setError(null);
      recognition.start();
      setIsListening(true);
      onListening?.(true);
    }
  }, [isListening, recognition, onListening]);

  if (!isSupported) {
    return null;
  }

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={toggleListening}
        className={`relative p-4 rounded-full transition-all duration-300 ${
          isListening
            ? 'bg-red-500 text-white scale-110 animate-pulse'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        }`}
        title={isListening ? 'جاري الاستماع...' : 'بحث صوتي'}
      >
        {isListening ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
          </svg>
        )}

        {/* Listening animation rings */}
        {isListening && (
          <>
            <span className="absolute inset-0 rounded-full bg-red-400 animate-ping opacity-75"></span>
            <span className="absolute inset-0 rounded-full bg-red-300 animate-ping opacity-50" style={{ animationDelay: '0.2s' }}></span>
          </>
        )}
      </button>

      {/* Transcript display */}
      {(isListening || transcript) && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-4 w-72 bg-white rounded-xl shadow-xl p-4 z-50" dir="rtl">
          <div className="flex items-center gap-2 mb-2">
            {isListening && (
              <span className="flex gap-1">
                <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                <span className="w-2 h-2 bg-red-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
              </span>
            )}
            <span className="text-sm text-gray-500">
              {isListening ? 'جاري الاستماع...' : 'نتيجة البحث'}
            </span>
          </div>
          <p className="text-gray-900 font-medium text-lg">
            {transcript || placeholder}
          </p>
          {error && (
            <p className="text-red-500 text-sm mt-2">{error}</p>
          )}
        </div>
      )}
    </div>
  );
}

// Voice Search Modal Component
interface VoiceSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResult: (text: string) => void;
}

export function VoiceSearchModal({ isOpen, onClose, onResult }: VoiceSearchModalProps) {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [recognition, setRecognition] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition();
        recognitionInstance.continuous = false;
        recognitionInstance.interimResults = true;
        recognitionInstance.lang = 'ar-EG';

        recognitionInstance.onresult = (event: any) => {
          const current = event.resultIndex;
          const result = event.results[current];
          const text = result[0].transcript;
          setTranscript(text);

          if (result.isFinal) {
            setTimeout(() => {
              onResult(text);
              onClose();
            }, 500);
          }
        };

        recognitionInstance.onerror = (event: any) => {
          setError('حدث خطأ أثناء التعرف على الصوت');
          setIsListening(false);
        };

        recognitionInstance.onend = () => {
          setIsListening(false);
        };

        setRecognition(recognitionInstance);
      }
    }
  }, [onResult, onClose]);

  useEffect(() => {
    if (isOpen && recognition) {
      setTranscript('');
      setError(null);
      recognition.start();
      setIsListening(true);
    } else if (!isOpen && recognition) {
      recognition.stop();
    }
  }, [isOpen, recognition]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center" dir="rtl">
      <div className="bg-white rounded-3xl p-8 max-w-md w-full mx-4 text-center">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 left-4 text-gray-400 hover:text-gray-600 text-2xl"
        >
          ✕
        </button>

        {/* Microphone animation */}
        <div className="relative w-32 h-32 mx-auto mb-6">
          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full bg-red-100 animate-ping"></div>
              <div className="absolute inset-4 rounded-full bg-red-200 animate-ping" style={{ animationDelay: '0.2s' }}></div>
              <div className="absolute inset-8 rounded-full bg-red-300 animate-ping" style={{ animationDelay: '0.4s' }}></div>
            </>
          )}
          <div className={`relative w-full h-full rounded-full flex items-center justify-center ${
            isListening ? 'bg-red-500' : 'bg-gray-200'
          }`}>
            <svg className={`w-12 h-12 ${isListening ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
          </div>
        </div>

        {/* Status text */}
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          {isListening ? 'جاري الاستماع...' : 'البحث الصوتي'}
        </h2>

        {/* Transcript */}
        <div className="min-h-[60px] flex items-center justify-center">
          {transcript ? (
            <p className="text-xl text-gray-700">{transcript}</p>
          ) : (
            <p className="text-gray-400">قل ما تبحث عنه...</p>
          )}
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-500 mt-2">{error}</p>
        )}

        {/* Examples */}
        <div className="mt-6 text-sm text-gray-500">
          <p className="mb-2">جرب أن تقول:</p>
          <div className="flex flex-wrap justify-center gap-2">
            {['آيفون 15', 'شقة في المعادي', 'سيارة تويوتا', 'لابتوب ديل'].map((example) => (
              <span key={example} className="bg-gray-100 px-3 py-1 rounded-full text-gray-600">
                "{example}"
              </span>
            ))}
          </div>
        </div>

        {/* Cancel button */}
        <button
          onClick={onClose}
          className="mt-6 px-8 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors"
        >
          إلغاء
        </button>
      </div>
    </div>
  );
}
