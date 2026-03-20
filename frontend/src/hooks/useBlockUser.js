import { useState } from "react";
import toast from "react-hot-toast";
import useConversation from "../../zustand/useConversation";

const useBlockUser = () => {
  const [loading, setLoading] = useState(false);
  const { blockedUsers, addBlocked, removeBlocked } = useConversation();

  const blockUser = async (userId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/block/${userId}`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      addBlocked(userId);
      toast.success("User blocked");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const unblockUser = async (userId) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/users/block/${userId}`, { method: "DELETE" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      removeBlocked(userId);
      toast.success("User unblocked");
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isBlocked = (userId) => blockedUsers.includes(userId);

  return { loading, blockUser, unblockUser, isBlocked, blockedUsers };
};

export default useBlockUser;
