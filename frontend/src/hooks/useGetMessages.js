import { useEffect, useState } from "react";
import useConversation from "../../zustand/useConversation";
import { useAuthContext } from "../context/AuthContext";
import useSuggestedReplies from "./useSuggestedReplies";
import toast from "react-hot-toast";

const useGetMessages = () => {
  const [loading, setLoading] = useState(false);
  const { messages, setMessages, selectedConversation } = useConversation();
  const { authUser } = useAuthContext();
  const { generateReplies } = useSuggestedReplies();

  useEffect(() => {
    const getMessages = async () => {
      setLoading(true);
      try {
        const endpoint = selectedConversation.isGroup
          ? `/api/groups/${selectedConversation._id}/messages`
          : `/api/messages/${selectedConversation._id}`;
        const res = await fetch(endpoint);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setMessages(data);

        // Trigger smart reply suggestions for the last received text message
        // senderId may be a string (1:1) or populated object (group)
        const lastReceived = [...data].reverse().find(
          (m) => (m.senderId?._id || m.senderId) !== authUser?._id && m.messageType !== "image"
        );
        if (lastReceived) generateReplies(lastReceived.message);
      } catch (error) {
        toast.error(error.message);
      } finally {
        setLoading(false);
      }
    };
    if (selectedConversation?._id) getMessages();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedConversation?._id, setMessages]);

  return { messages, loading };
};

export default useGetMessages;
