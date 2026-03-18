import Anthropic from "@anthropic-ai/sdk";
import OpenAI from "openai";
import { GoogleGenerativeAI } from "@google/generative-ai";

// ─── Clients ────────────────────────────────────────────────────────────────

const anthropic = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

// Grok uses xAI's OpenAI-compatible endpoint
const grok = new OpenAI({
  apiKey: process.env.GROK_API_KEY,
  baseURL: "https://api.x.ai/v1",
});

const geminiClient = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// ─── Prompt Engineering ──────────────────────────────────────────────────────
//
// Goal: extract maximum quality from each model in a casual chat context.
// Principles applied:
//   1. Role + persona definition  – anchors the model's behaviour
//   2. Response format contract   – prevents rambling / walls of text
//   3. Explicit anti-patterns     – ban filler phrases, redundancy, over-hedging
//   4. Chain-of-thought lite      – ask for steps only when the topic needs it
//   5. Fallback honesty clause    – admit uncertainty rather than hallucinate
// ─────────────────────────────────────────────────────────────────────────────

const SYSTEM_PROMPTS = {
  grok: `You are Grok, a sharp and direct AI assistant built into a chat application.

RESPONSE RULES — follow these strictly:
1. Lead with the answer. Put the key point in the very first sentence.
2. Be concise: 1–3 short paragraphs for most replies. Use bullet points or numbered steps only when sequencing genuinely matters.
3. No filler: never open with "Great question!", "Certainly!", "Of course!" or similar.
4. For code: wrap it in a fenced code block with the language tag. Add a one-line comment per non-obvious line.
5. For multi-step problems: number each step clearly and explain the *why* behind each one.
6. Acknowledge what you don't know. Say "I'm not certain, but…" rather than guessing as fact.
7. Match the user's register — if they're casual, be casual; if they're technical, be precise.
8. Avoid repeating information already established in the conversation.

You are allowed to have opinions and be direct. Prioritise clarity over comprehensiveness.`,

  gemini: `You are a helpful AI assistant integrated into a real-time chat application, powered by Google Gemini.

RESPONSE RULES — follow these strictly:
1. Chat brevity: this is a messaging app, not a document editor. Keep answers short and readable on a phone screen.
2. Structure by complexity:
   - Simple factual question → 1–2 sentences.
   - Explanation needed → lead sentence + up to 4 bullet points.
   - Step-by-step task → numbered list, one action per item.
3. No padding: do not start with acknowledgements ("Sure!", "Absolutely!", "Happy to help!"). Go straight to the answer.
4. Code formatting: always use a fenced code block with a language identifier. Keep code minimal — just enough to illustrate the point.
5. When comparing options: use a two-column "| Option | Reason |" table only if there are 3+ items; otherwise use prose.
6. Honesty: if you are uncertain, say so explicitly ("I'm not fully sure, but…"). Do not invent facts.
7. Tone: friendly and approachable, but efficient — like a knowledgeable friend who respects your time.
8. Never repeat the user's question back to them.`,

  claude: `You are a knowledgeable, thoughtful AI assistant in a real-time chat application, powered by Claude.

RESPONSE RULES — follow these strictly:
1. Answer first, explain second. Don't bury the lead.
2. Length calibration: match depth to the question's complexity. One-line questions deserve one-line answers; nuanced questions deserve more.
3. No hollow openers: skip "Great!", "Certainly!", "Of course!" — start with substance.
4. Code: fenced blocks with language tag. Comment only non-obvious logic. Prefer working minimal examples over exhaustive ones.
5. Reasoning transparency: for decisions or recommendations, briefly state *why* you chose that answer.
6. Uncertainty: flag it plainly — "I'm not certain, but…" — rather than hedging every sentence with "may" and "might".
7. Conversation continuity: reference prior context when relevant; don't re-explain things already covered.
8. Use markdown sparingly — headers only for long structured responses, not for two-sentence answers.`,
};

// ─── Provider Handlers ────────────────────────────────────────────────────────

async function callClaude(message, history) {
  const messages = [
    ...history,
    { role: "user", content: message },
  ];

  const response = await anthropic.messages.create({
    model: "claude-haiku-4-5-20251001",
    max_tokens: 1024,
    system: SYSTEM_PROMPTS.claude,
    messages,
  });

  return response.content[0].text;
}

async function callGrok(message, history) {
  // xAI uses the OpenAI messages format (role: user | assistant)
  const messages = [
    { role: "system", content: SYSTEM_PROMPTS.grok },
    ...history,
    { role: "user", content: message },
  ];

  const response = await grok.chat.completions.create({
    model: "grok-3-mini",
    max_tokens: 1024,
    messages,
  });

  return response.choices[0].message.content;
}

async function callGemini(message, history) {
  const model = geminiClient.getGenerativeModel({
    model: "gemini-2.0-flash",
    systemInstruction: SYSTEM_PROMPTS.gemini,
    generationConfig: { maxOutputTokens: 1024 },
  });

  // Gemini uses role "user" / "model" (not "assistant")
  const geminiHistory = history.map((msg) => ({
    role: msg.role === "assistant" ? "model" : "user",
    parts: [{ text: msg.content }],
  }));

  const chat = model.startChat({ history: geminiHistory });
  const result = await chat.sendMessage(message);
  return result.response.text();
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export const aiChat = async (req, res) => {
  try {
    const { message, conversationHistory, provider = "grok" } = req.body;

    if (!message) {
      return res.status(400).json({ error: "Message is required" });
    }

    const history = conversationHistory || [];
    let reply;

    switch (provider) {
      case "grok":
        reply = await callGrok(message, history);
        break;
      case "gemini":
        reply = await callGemini(message, history);
        break;
      case "claude":
        reply = await callClaude(message, history);
        break;
      default:
        return res.status(400).json({ error: `Unknown provider: ${provider}` });
    }

    res.status(200).json({ reply, provider });
  } catch (error) {
    console.log(`Error in AI chat (${req.body?.provider}): ${error.message}`);

    // Surface friendly errors for missing API keys
    if (error.status === 401 || error.status === 403) {
      const keyName = {
        grok: "GROK_API_KEY",
        gemini: "GEMINI_API_KEY",
        claude: "ANTHROPIC_API_KEY",
      }[req.body?.provider] || "API key";
      return res.status(500).json({
        error: `${req.body?.provider || "AI"} service not configured — please add ${keyName} to your environment.`,
      });
    }

    res.status(500).json({ error: "AI service error: " + error.message });
  }
};
