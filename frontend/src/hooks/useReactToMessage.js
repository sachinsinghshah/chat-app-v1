import { useState } from "react";
import useConversation from "../../zustand/useConversation";
import toast from "react-hot-toast";

const useReactToMessage = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages } = useConversation();

  const reactToMessage = async (messageId, emoji) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/messages/react/${messageId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ emoji }),
      });
      const data = await res.json();
      if (data.error) throw new Error(data.error);

      setMessages(
        messages.map((msg) =>
          msg._id === messageId ? { ...msg, reactions: data.reactions } : msg
        )
      );
    } catch (error) {
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  return { reactToMessage, loading };
};

export default useReactToMessage;
