import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import useConversation from "../../zustand/useConversation";

const useGetGroups = () => {
  const [loading, setLoading] = useState(false);
  const { groups, setGroups } = useConversation();

  useEffect(() => {
    const fetchGroups = async () => {
      setLoading(true);
      try {
        const res = await fetch("/api/groups");
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setGroups(data);
      } catch (err) {
        toast.error(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchGroups();
  }, [setGroups]);

  return { loading, groups };
};

export default useGetGroups;
