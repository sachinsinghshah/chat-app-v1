import { useState } from "react";
import toast from "react-hot-toast";
import useConversation from "../../zustand/useConversation";

const useEditMessage = () => {
  const [loading, setLoading] = useState(false);
  const { updateMessage } = useConversation();

  const editMessage = async (messageId, newText) => {
    if (!newText?.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/messages/${messageId}/edit`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: newText.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      updateMessage(messageId, { message: data.message, edited: true, editedAt: data.editedAt });
      return true;
    } catch (err) {
      toast.error(err.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return { loading, editMessage };
};

export default useEditMessage;
