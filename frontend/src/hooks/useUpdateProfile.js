import { useState } from "react";
import toast from "react-hot-toast";
import { useAuthContext } from "../context/AuthContext";

const useUpdateProfile = () => {
  const [loading, setLoading] = useState(false);
  const { setAuthUser } = useAuthContext();

  const updateProfile = async ({ profilePic, fullName }) => {
    setLoading(true);
    try {
      const res = await fetch("/api/users/update-profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ profilePic, fullName }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Update failed");

      // Keep full stored user object in sync
      setAuthUser((prev) => {
        const updated = { ...prev, ...data };
        localStorage.setItem("chat-user", JSON.stringify(updated));
        return updated;
      });

      toast.success("Profile updated!");
      return data;
    } catch (err) {
      toast.error(err.message);
      return null;
    } finally {
      setLoading(false);
    }
  };

  return { loading, updateProfile };
};

export default useUpdateProfile;
