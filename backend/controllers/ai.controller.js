import Anthropic from "@anthropic-ai/sdk";

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export const aiChat = async (req, res) => {
  try {
    const { message, conversationHistory } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    // Build messages array for the API
    const messages = [
      ...(conversationHistory || []),
      { role: "user", content: message },
    ];

    const response = await anthropic.messages.create({
      model: "claude-haiku-4-5-20251001",
      max_tokens: 1024,
      system:
        "You are a helpful, friendly AI assistant in a chat application. Keep your responses concise and conversational. You can help with questions, have casual conversations, write code, brainstorm ideas, and more. Use markdown sparingly since this is a chat interface.",
      messages,
    });

    const aiReply = response.content[0].text;

    res.status(200).json({ reply: aiReply });
  } catch (error) {
    console.log("Error in AI chat: " + error.message);
    if (error.status === 401) {
      return res.status(500).json({ error: "AI service not configured. Please add ANTHROPIC_API_KEY." });
    }
    res.status(500).json({ error: "AI service error: " + error.message });
  }
};
