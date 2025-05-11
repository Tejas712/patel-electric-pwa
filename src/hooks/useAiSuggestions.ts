import { useState } from 'react';
import type { FieldType } from '../data/field';
import { sendMessage } from '../services/gemini';

interface UseAiSuggestionsProps {
  priceFields: FieldType[];
}

export const useAiSuggestions = ({ priceFields }: UseAiSuggestionsProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<FieldType[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateSuggestions = async (prompt: string) => {
    if (!prompt.trim()) {
      setError("Please enter a prompt");
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await sendMessage(priceFields, prompt);
      if (response.fields) {
        setSuggestions(response.fields);
      } else {
        setError("No suggestions generated");
      }
    } catch (error) {
      console.error("Error getting AI suggestions:", error);
      setError("Failed to get AI suggestions. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const clearSuggestions = () => {
    setSuggestions(null);
    setError(null);
  };

  return {
    isLoading,
    suggestions,
    error,
    generateSuggestions,
    clearSuggestions,
  };
}; 