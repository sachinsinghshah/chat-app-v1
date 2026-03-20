import { useState, useRef } from "react";
import { FiSearch, FiX } from "react-icons/fi";
import useConversation from "../../../zustand/useConversation";
import { extractTime } from "../../utils/extractTime";

const MessageSearch = ({ onClose }) => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const { selectedConversation } = useConversation();
  const debounceRef = useRef(null);

  const search = async (q) => {
    if (q.trim().length < 2) { setResults([]); return; }
    setLoading(true);
    try {
      const res = await fetch(
        `/api/messages/search?q=${encodeURIComponent(q)}&with=${selectedConversation._id}`
      );
      const data = await res.json();
      if (!data.error) setResults(data);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => search(val), 300);
  };

  const highlight = (text, q) => {
    if (!q.trim()) return text;
    // Escape regex special characters so user input doesn't break the pattern
    const escaped = q.trim().replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const parts = text.split(new RegExp(`(${escaped})`, "gi"));
    return parts.map((part, i) =>
      part.toLowerCase() === q.trim().toLowerCase() ? (
        <mark key={i} className="bg-indigo-500/40 text-white rounded px-0.5">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="border-b border-gray-700/60 bg-gray-900/90 backdrop-blur-sm">
      {/* Search input */}
      <div className="px-4 py-3 flex items-center gap-2">
        <FiSearch className="text-gray-400 shrink-0" size={16} />
        <input
          autoFocus
          type="text"
          value={query}
          onChange={handleChange}
          placeholder="Search messages..."
          className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 outline-none"
        />
        <button onClick={onClose} className="text-gray-400 hover:text-white shrink-0">
          <FiX size={18} />
        </button>
      </div>

      {/* Results */}
      {(results.length > 0 || loading) && (
        <div className="max-h-64 overflow-y-auto border-t border-gray-700/40">
          {loading && (
            <div className="flex justify-center py-4">
              <span className="loading loading-spinner w-5 h-5 text-indigo-400" />
            </div>
          )}
          {results.map((msg) => (
            <div key={msg._id} className="px-4 py-2.5 border-b border-gray-700/30 hover:bg-gray-800/50">
              <p className="text-xs text-gray-400 mb-0.5">{extractTime(msg.createdAt)}</p>
              <p className="text-sm text-gray-200">{highlight(msg.message, query)}</p>
            </div>
          ))}
          {!loading && results.length === 0 && query.trim().length >= 2 && (
            <p className="text-center text-sm text-gray-500 py-4">No results</p>
          )}
        </div>
      )}
    </div>
  );
};

export default MessageSearch;
