import React, { useState } from 'react';
import { startChat, type ChatMessage } from '../services/gemini';
import { FaPaperPlane, FaSpinner, FaExclamationTriangle } from 'react-icons/fa';
import type { FieldType } from '../data/field';

const GeminiChat: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: ChatMessage = {
      role: 'user',
      content: input.trim(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);
    setError(null);

    try {
      const response = await startChat([...messages, userMessage]);
      console.log("check response =>>", response);
      if (!response.text || response.text.trim() === '') {
        throw new Error('No response received from AI');
      }
      const modelMessage: ChatMessage = {
        role: 'model',
        content: response.text,
        fields: response.fields,
      };
      setMessages(prev => [...prev, modelMessage]);
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: ChatMessage = {
        role: 'model',
        content: "I apologize, but I'm unable to provide a response at the moment. Please try rephrasing your question or try again later.",
      };
      setMessages(prev => [...prev, errorMessage]);
      setError('Failed to get response from AI');
    } finally {
      setIsLoading(false);
    }
  };

  const renderFields = (fields: FieldType[]) => {
    return (
      <div className="mt-2 space-y-2">
        {fields.map((field) => (
          <div key={field.id} className="bg-white rounded-lg p-3 border border-gray-200">
            <div className="font-semibold text-gray-700">{field.label}</div>
            <div className="text-gray-600">
              {field.value}
              {field.unit && <span className="ml-1">{field.unit}</span>}
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-lg shadow-lg">
      {error && (
        <div className="bg-red-50 border-l-4 border-red-500 p-4 mb-4">
          <div className="flex items-center">
            <FaExclamationTriangle className="text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${
              message.role === 'user' ? 'justify-end' : 'justify-start'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-yellow-500 text-white'
                  : 'bg-gray-100 text-gray-800'
              }`}
            >
              {message.content}
              {message.fields && renderFields(message.fields)}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 rounded-lg p-3">
              <FaSpinner className="animate-spin" />
            </div>
          </div>
        )}
      </div>
      <form onSubmit={handleSubmit} className="p-4 border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            className="flex-1 rounded-lg px-4 py-2 border border-gray-300 focus:outline-none focus:ring-2 focus:ring-yellow-400"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-yellow-500 hover:bg-yellow-600 text-white rounded-lg px-4 py-2 transition disabled:opacity-50"
          >
            <FaPaperPlane />
          </button>
        </div>
      </form>
    </div>
  );
};

export default GeminiChat; 