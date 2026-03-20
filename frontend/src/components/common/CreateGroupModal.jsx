import { useState } from "react";
import { IoClose } from "react-icons/io5";
import { FiUsers } from "react-icons/fi";
import toast from "react-hot-toast";
import useGetConversations from "../../hooks/useGetConversations";
import useConversation from "../../../zustand/useConversation";
import UserAvatar from "./UserAvatar";

const CreateGroupModal = ({ onClose }) => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selected, setSelected] = useState([]);
  const [loading, setLoading] = useState(false);
  const { conversations } = useGetConversations();
  const { addGroup, setSelectedConversation } = useConversation();

  const toggleMember = (id) =>
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const handleCreate = async () => {
    if (!name.trim()) return toast.error("Group name is required");
    if (selected.length === 0) return toast.error("Add at least one member");
    setLoading(true);
    try {
      const res = await fetch("/api/groups", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, description, members: selected }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);
      addGroup(data);
      setSelectedConversation({ ...data, isGroup: true });
      toast.success(`Group "${data.name}" created!`);
      onClose();
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl w-full max-w-md mx-4 p-6 flex flex-col gap-4">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FiUsers className="text-purple-400" size={20} />
            <h2 className="text-lg font-bold text-white">New Group</h2>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <IoClose size={22} />
          </button>
        </div>

        {/* Group name */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Group Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Design Team"
            className="bg-gray-800 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Description */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Description (optional)
          </label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's this group about?"
            className="bg-gray-800 border border-gray-600 rounded-xl px-3 py-2 text-white text-sm outline-none focus:border-purple-500 transition-colors"
          />
        </div>

        {/* Member picker */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
            Add Members ({selected.length} selected)
          </label>
          <div className="max-h-48 overflow-y-auto flex flex-col gap-1 pr-1">
            {conversations.map((user) => (
              <button
                key={user._id}
                onClick={() => toggleMember(user._id)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl transition-all text-left ${
                  selected.includes(user._id)
                    ? "bg-purple-600/30 ring-1 ring-purple-500/40"
                    : "hover:bg-gray-700/50"
                }`}
              >
                <UserAvatar user={user} size={32} />
                <span className="text-sm text-gray-100">{user.fullName}</span>
                {selected.includes(user._id) && (
                  <span className="ml-auto text-purple-400 text-xs font-bold">✓</span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-1">
          <button
            onClick={onClose}
            className="flex-1 py-2 rounded-xl border border-gray-600 text-gray-300 hover:bg-gray-800 text-sm transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={handleCreate}
            disabled={loading}
            className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-sm font-semibold transition-colors disabled:opacity-50"
          >
            {loading ? <span className="loading loading-spinner w-4 h-4" /> : "Create Group"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateGroupModal;
