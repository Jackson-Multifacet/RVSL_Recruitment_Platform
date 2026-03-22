import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export const realAssistant = {
  async generateJobDescription(title: string, company: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Generate a professional job description for a ${title} position at ${company}. Include responsibilities, requirements, and benefits.`,
    });
    return response.text;
  },

  async screenCandidate(candidateData: any, jobData: any) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `As a recruitment assistant, evaluate this candidate for the following job.
      
      Candidate: ${JSON.stringify(candidateData)}
      Job: ${JSON.stringify(jobData)}
      
      Provide a brief summary of their fit and a recommendation (Strong Fit, Potential Fit, or Not a Fit).`,
    });
    return response.text;
  },

  async chat(message: string, context?: string) {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `You are "Real Assistant", a helpful recruitment and career assistant for the RVSL platform. 
      ${context ? `Context: ${context}` : ''}
      User: ${message}`,
    });
    return response.text;
  }
};
