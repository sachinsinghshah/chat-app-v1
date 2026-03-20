import { useEffect } from "react";
import useConversation from "../../zustand/useConversation";

const useGetBlockedUsers = () => {
  const { setBlockedUsers } = useConversation();

  useEffect(() => {
    const fetch_ = async () => {
      try {
        const res = await fetch("/api/users/blocked");
        const data = await res.json();
        if (!data.error) setBlockedUsers(data);
      } catch {
        // silently fail — blocked users will start empty
      }
    };
    fetch_();
  }, [setBlockedUsers]);
};

export default useGetBlockedUsers;
