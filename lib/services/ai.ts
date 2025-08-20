import { functions } from '../appwrite';

interface StudyPlanRequest {
  subject: string;
  duration: number; // in days
  dailyStudyTime: number; // in hours
  difficulty: string;
}

class AIService {
  async generateStudyPlan(request: StudyPlanRequest): Promise<string> {
    console.log("Generating study plan with request:", request);

    // In a real application, you would make an API call to OpenAI here.
    // Example prompt construction:
    const prompt = `
      Create a ${request.duration}-day study plan for the subject "${request.subject}"
      at a ${request.difficulty} level. The user can study for
      ${request.dailyStudyTime} hours per day. Provide a detailed, day-by-day roadmap.
    `;

    // Simulate a delay for the AI response
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Simulated response
    const simulatedRoadmap = `
      ### Your ${request.duration}-Day Study Plan for ${request.subject} ###

      **Day 1-3: Foundations**
      - **Topic:** Introduction to ${request.subject}
      - **Daily Task:** Read Chapter 1, watch introductory videos.
      - **Time:** ${request.dailyStudyTime} hours

      **Day 4-7: Core Concepts**
      - **Topic:** Core principles of ${request.subject}
      - **Daily Task:** Work through practical examples and solve 5 easy problems.
      - **Time:** ${request.dailyStudyTime} hours

      ... and so on for ${request.duration} days.
    `;

    return simulatedRoadmap;
  }

  async getAIResponseForChat(prompt: string): Promise<string> {
    try {
        const functionId = process.env.NEXT_PUBLIC_APPWRITE_AI_CHAT_FUNCTION_ID!;
        if (!functionId) {
            throw new Error("AI chat function ID is not configured.");
        }

        const result = await functions.createExecution(
            functionId,
            JSON.stringify({ prompt }),
            false // async
        );

        if (result.status === 'completed') {
            const response = JSON.parse(result.response);
            return response.response || "Sorry, I couldn't process that.";
        } else {
            // You might want to implement polling here to wait for async functions
            console.error("AI function execution failed or timed out:", result.stderr);
            return "The AI assistant is taking too long to respond. Please try again later.";
        }
    } catch (error) {
        console.error("Error calling AI chat function:", error);
        return "There was an error communicating with the AI assistant.";
    }
  }
}

export const aiService = new AIService();
