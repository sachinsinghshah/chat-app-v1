import { useState } from "react";
import useConversation from "../../zustand/useConversation";
import toast from "react-hot-toast";

const useAIChat = () => {
  const [loading, setLoading] = useState(false);
  const { addAiMessage, selectedAIProvider, aiMessagesByProvider } =
    useConversation();

  // Current provider's messages (live reference)
  const aiMessages = aiMessagesByProvider[selectedAIProvider] || [];

  const sendToAI = async (message) => {
    setLoading(true);
    try {
      // Build history for the active provider (last 20 turns)
      const history = aiMessages.slice(-20).map((msg) => ({
        role: msg.role,
        content: msg.content,
      }));

      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message,
          conversationHistory: history,
          provider: selectedAIProvider,
        }),
      });

      const data = await res.json();
      if (data.error) throw new Error(data.error);

      addAiMessage({
        role: "user",
        content: message,
        timestamp: new Date().toISOString(),
        provider: selectedAIProvider,
      });
      addAiMessage({
        role: "assistant",
        content: data.reply,
        timestamp: new Date().toISOString(),
        provider: selectedAIProvider,
      });

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
