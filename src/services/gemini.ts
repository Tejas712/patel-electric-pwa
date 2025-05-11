import { GoogleGenerativeAI } from "@google/generative-ai";
import type { FieldType } from "../data/field";

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY);

// Get the generative model
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface ChatMessage {
  role: "user" | "model";
  content: string;
  fields?: FieldType[];
}

const SYSTEM_PROMPT = (fields: FieldType[], details: string) => {
  return `
    You are a helpful assistant that provides responses in JSON format matching the following interface:
interface FieldType {
  id: number;
  label: string;
  value?: number | string;
  unit?: string;
}

I have a list of electrical work items with id, label, value (optional), and unit (optional) in JSON format.
data :${JSON.stringify(fields)}

find value according to these details 
${details}

change value according to these details
  
Give me a data in JSON format.`;
};

export const sendMessage = async (
  fields: FieldType[],
  message: string
): Promise<{ text: string; fields?: FieldType[] }> => {
  try {
    const prompt = `${SYSTEM_PROMPT(fields, message)}`;
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    const cleaned = text
      .replace(/```json/i, "")
      .replace(/```/g, "")
      .trim();

    try {
      // Try to parse the response as JSON
      const fields = JSON.parse(cleaned) as FieldType[];
      return { text, fields };
    } catch {
      // If parsing fails, return just the text
      return { text };
    }
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to get response from Gemini");
  }
};

export const startChat = async (
  messages: ChatMessage[]
): Promise<{ text: string; fields?: FieldType[] }> => {
  try {
    const chat = model.startChat({
      history: messages.map((msg) => ({
        role: msg.role,
        parts: [{ text: msg.content }],
      })),
    });
    const message = `${SYSTEM_PROMPT}\n\nUser message: ${
      messages[messages.length - 1].content
    }`;
    const result = await chat.sendMessage(message);

    const response = await result.response;
    const raw = response.text();
    const cleaned = raw
      .replace(/```json/i, "")
      .replace(/```/g, "")
      .trim();
    try {
      // Try to parse the response as JSON
      const fields = JSON.parse(cleaned) as FieldType[];
      return { text: raw, fields };
    } catch {
      // If parsing fails, return just the text
      return { text: raw };
    }
  } catch (error) {
    console.error("Error in chat with Gemini:", error);
    throw new Error("Failed to get response from Gemini chat");
  }
};
