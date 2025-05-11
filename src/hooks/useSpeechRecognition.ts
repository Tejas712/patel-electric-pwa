import { useState, useEffect } from 'react';

interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  resultIndex: number;
  interpretation: Record<string, unknown>;
}

interface SpeechRecognitionErrorEvent extends Event {
  error: string;
  message: string;
}

interface SpeechRecognition extends EventTarget {
  continuous: boolean;
  interimResults: boolean;
  lang: string;
  onresult: (event: SpeechRecognitionEvent) => void;
  onerror: (event: SpeechRecognitionErrorEvent) => void;
  onend: () => void;
  start: () => void;
  stop: () => void;
  abort: () => void;
}

declare global {
  interface Window {
    webkitSpeechRecognition: new () => SpeechRecognition;
  }
}

interface UseSpeechRecognitionProps {
  onTranscriptChange: (transcript: string) => void;
  language?: string;
}

export const useSpeechRecognition = ({ 
  onTranscriptChange, 
  language = 'gu-IN' 
}: UseSpeechRecognitionProps) => {
  const [isListening, setIsListening] = useState(false);
  const [speechRecognition, setSpeechRecognition] = useState<SpeechRecognition | null>(null);

  useEffect(() => {
    if ("webkitSpeechRecognition" in window) {
      const recognition = new window.webkitSpeechRecognition();
      recognition.continuous = true;
      recognition.interimResults = true;
      recognition.lang = language;

      recognition.onresult = (event: SpeechRecognitionEvent) => {
        const transcript = Array.from(event.results)
          .map((result) => result[0])
          .map((result) => result.transcript)
          .join("");

        onTranscriptChange(transcript);
      };

      recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
        console.error("Speech recognition error:", event.error);
        setIsListening(false);
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      setSpeechRecognition(recognition);
    }
  }, [language, onTranscriptChange]);

  const toggleListening = () => {
    if (!speechRecognition) {
      alert("Speech recognition is not supported in your browser.");
      return;
    }

    if (isListening) {
      speechRecognition.stop();
    } else {
      speechRecognition.start();
    }
    setIsListening(!isListening);
  };

  const stopListening = () => {
    if (speechRecognition && isListening) {
      speechRecognition.stop();
      setIsListening(false);
    }
  };

  return {
    isListening,
    toggleListening,
    stopListening,
    isSupported: !!speechRecognition
  };
}; 