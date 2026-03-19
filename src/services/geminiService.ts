import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const generateReportSummary = async (data: any) => {
  const response = await ai.models.generateContent({
    model: "gemini-3-flash-preview",
    contents: `قم بتحليل البيانات التالية لنظام ERP الخاص بمحل عطارة وقدم ملخصاً تنفيذياً قصيراً بالعربية: ${JSON.stringify(data)}`,
  });
  return response.text;
};
