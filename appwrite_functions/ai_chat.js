const { Client } = require('node-appwrite');
// You would typically use a library like 'openai' here
// const { OpenAI } = require('openai');

/*
  This Appwrite Function is triggered by an HTTP POST request from the application's AI service.
  It takes a chat prompt, gets a response from an AI model, and returns it.

  Required Environment Variables:
  - APPWRITE_API_KEY: An Appwrite API key.
  - APPWRITE_ENDPOINT: Your Appwrite endpoint.
  - APPWRITE_PROJECT_ID: Your Appwrite project ID.
  - OPENAI_API_KEY: Your API key for the OpenAI service.

  Trigger:
  - Can be triggered via an HTTP POST request.
*/

// const openai = new OpenAI({
//   apiKey: process.env.OPENAI_API_KEY,
// });

const getMockAIResponse = (prompt) => {
    const responses = [
        `That's a great question about "${prompt.substring(0, 20)}..."! Here is a detailed explanation.`,
        `Thinking about "${prompt.substring(0, 20)}...", I've found that the best approach is...`,
        `I can help with that! For "${prompt.substring(0, 20)}...", you should consider the following points...`
    ];
    return responses[Math.floor(Math.random() * responses.length)];
}

module.exports = async (req, res) => {
  const client = new Client()
    .setEndpoint(process.env.APPWRITE_ENDPOINT)
    .setProject(process.env.APPWRITE_PROJECT_ID)
    .setKey(process.env.APPWRITE_API_KEY);

  try {
    const { prompt } = JSON.parse(req.payload);

    if (!prompt) {
      return res.json({ error: "Prompt is required" }, 400);
    }

    // In a real implementation, you would call the OpenAI API here
    // const completion = await openai.chat.completions.create({
    //   messages: [{ role: "user", content: prompt }],
    //   model: "gpt-3.5-turbo",
    // });
    // const aiResponse = completion.choices[0].message.content;

    // For this example, we'll use a mock response.
    const aiResponse = getMockAIResponse(prompt);

    res.json({ response: aiResponse });

  } catch (error) {
    console.error("Error getting AI response:", error);
    res.json({ success: false, error: error.message }, 500);
  }
};
