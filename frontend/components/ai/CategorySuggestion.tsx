/**
 * AI Category Suggestion Component
 * Shows auto-suggested categories based on title/description
 */

import React from 'react';
import { CategorySuggestion as CategorySuggestionType } from '@/lib/api/ai';

interface CategorySuggestionProps {
  suggestions: CategorySuggestionType[];
  onSelect: (categoryId: string) => void;
  loading?: boolean;
}

export function CategorySuggestion({ suggestions, onSelect, loading }: CategorySuggestionProps) {
  if (loading) {
    return (
      <div className="mt-2 p-3 bg-purple-50 border border-purple-200 rounded-md">
        <div className="flex items-center text-sm text-purple-800">
          <svg
            className="animate-spin h-4 w-4 mr-2"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
          AI is analyzing your item...
        </div>
      </div>
    );
  }

  if (!suggestions || suggestions.length === 0) {
    return null;
  }

  const primarySuggestion = suggestions[0];
  const alternat ives = suggestions.slice(1, 3); // Show top 3 alternatives

  return (
    <div className="mt-2 p-4 bg-purple-50 border border-purple-300 rounded-md">
      <div className="flex items-start">
        <svg
          className="h-5 w-5 text-purple-600 mr-2 mt-0.5"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path d="M11 3a1 1 0 10-2 0v1a1 1 0 102 0V3zM15.657 5.757a1 1 0 00-1.414-1.414l-.707.707a1 1 0 001.414 1.414l.707-.707zM18 10a1 1 0 01-1 1h-1a1 1 0 110-2h1a1 1 0 011 1zM5.05 6.464A1 1 0 106.464 5.05l-.707-.707a1 1 0 00-1.414 1.414l.707.707zM5 10a1 1 0 01-1 1H3a1 1 0 110-2h1a1 1 0 011 1zM8 16v-1h4v1a2 2 0 11-4 0zM12 14c.015-.34.208-.646.477-.859a4 4 0 10-4.954 0c.27.213.462.519.476.859h4.002z" />
        </svg>
        <div className="flex-1">
          <p className="text-sm font-medium text-purple-800">🤖 AI Category Suggestion</p>

          {/* Primary Suggestion */}
          <div className="mt-2">
            <button
              onClick={() => onSelect(primarySuggestion.id)}
              className="inline-flex items-center px-3 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-md transition-colors"
            >
              <svg
                className="h-4 w-4 mr-1.5"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              {primarySuggestion.parentCategory && `${primarySuggestion.parentCategory} → `}
              {primarySuggestion.name}
              <span className="ml-2 px-2 py-0.5 bg-purple-800 rounded-full text-xs">
                {Math.round(primarySuggestion.confidence * 100)}% match
              </span>
            </button>
          </div>

          {/* Alternative Suggestions */}
          {alternatives.length > 0 && (
            <div className="mt-3">
              <p className="text-xs text-purple-700 mb-1">Or try these:</p>
              <div className="space-y-1">
                {alternatives.map((alt) => (
                  <button
                    key={alt.id}
                    onClick={() => onSelect(alt.id)}
                    className="block w-full text-left px-3 py-1.5 bg-white border border-purple-200 hover:bg-purple-50 text-sm text-purple-700 rounded transition-colors"
                  >
                    {alt.parentCategory && `${alt.parentCategory} → `}
                    {alt.name}
                    <span className="ml-2 text-xs text-purple-500">
                      ({Math.round(alt.confidence * 100)}% match)
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          <p className="mt-2 text-xs text-purple-600">
            💡 Click a suggestion to auto-fill your category
          </p>
        </div>
      </div>
    </div>
  );
}
