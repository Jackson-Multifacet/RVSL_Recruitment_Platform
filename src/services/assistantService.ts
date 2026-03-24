export const assistant = {
  async generateJobDescription(title: string, company: string) {
    const prompt = `Generate a professional job description for a ${title} position at ${company}. Include responsibilities, requirements, and benefits.`;
    return fetchAIResponse(prompt);
  },

  async screenCandidate(candidateData: any, jobData: any) {
    const prompt = `As a recruitment assistant, evaluate this candidate for the following job.

      Candidate: ${JSON.stringify(candidateData)}
      Job: ${JSON.stringify(jobData)}

      Provide a brief summary of their fit and a recommendation (Strong Fit, Potential Fit, or Not a Fit).`;
    return fetchAIResponse(prompt);
  },

  async chat(message: string, context?: string) {
    const prompt = `You are "Real Assistant", a helpful recruitment and career assistant for the RVSL platform.
      ${context ? `Context: ${context}` : ''}
      User: ${message}`;
    return fetchAIResponse(prompt);
  }
};

async function fetchAIResponse(prompt: string): Promise<string> {
  try {
    const res = await fetch('/api/assistant', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ prompt })
    });

    if (!res.ok) {
      throw new Error('Failed to fetch AI response');
    }

    const data = await res.json();
    return data.text || 'No response';
  } catch (error) {
    console.error("AI Service Error:", error);
    return "I'm sorry, I'm having trouble thinking right now. Please try again later.";
  }
}

