import { useCallback } from "react";
import useConversation from "../../zustand/useConversation";

const useSuggestedReplies = () => {
  const { setSuggestedReplies, selectedAIProvider } = useConversation();

  const generateReplies = useCallback(
    async (messageText) => {
      if (!messageText || messageText.startsWith("🚫") || messageText === "🔥 Burned") return;

      setSuggestedReplies([]); // clear stale replies immediately

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `Suggest exactly 3 short (under 8 words each) casual chat replies to: "${messageText}". Reply ONLY with a JSON array: ["reply1", "reply2", "reply3"]. No explanation.`,
            conversationHistory: [],
            provider: selectedAIProvider,
          }),
        });

        if (!res.ok) return;
        const data = await res.json();
        const match = (data.reply || "").match(/\[[\s\S]*?\]/);
        if (match) {
          const replies = JSON.parse(match[0]);
          if (Array.isArray(replies) && replies.length > 0) {
            setSuggestedReplies(replies.slice(0, 3).filter(Boolean));
          }
        }
      } catch (_) {
        // Silent fail — suggestions are non-critical
      }
    },
    [setSuggestedReplies, selectedAIProvider]
  );

  return { generateReplies };
};

export default useSuggestedReplies;
