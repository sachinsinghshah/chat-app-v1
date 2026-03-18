import { useState } from "react";
import useConversation from "../../zustand/useConversation";
import toast from "react-hot-toast";

const useAIChat = () => {
  const [loading, setLoading] = useState(false);
  const { aiMessages, addAiMessage } = useConversation();

  const sendToAI = async (message) => {
    setLoading(true);
    try {
      // Build conversation history for Claude API (last 20 messages for context)
      const history = aiMessages.slice(-20).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, conversationHistory: history }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      // Add user message then AI reply
      addAiMessage({ role: "user", content: message });
      addAiMessage({ role: "assistant", content: data.reply });

      return data.reply;
    } catch (error) {
      toast.error(error.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { sendToAI, loading, aiMessages };
};

export default useAIChat;
