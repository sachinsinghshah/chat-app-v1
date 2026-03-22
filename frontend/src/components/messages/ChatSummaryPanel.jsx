import { useEffect, useState } from "react";
import { IoClose } from "react-icons/io5";
import { FiZap, FiCopy } from "react-icons/fi";
import useConversation from "../../../zustand/useConversation";
import { useAuthContext } from "../../context/AuthContext";
import toast from "react-hot-toast";

const ChatSummaryPanel = ({ onClose }) => {
  const [summary, setSummary] = useState("");
  const [loading, setLoading] = useState(true);
  const { messages, selectedAIProvider } = useConversation();
  const { authUser } = useAuthContext();

  useEffect(() => {
    const generate = async () => {
      const recent = messages
        .slice(-30)
        .filter((m) => !m.deleted && m.messageType !== "image");

      if (recent.length === 0) {
        setSummary("No text messages to summarize.");
        setLoading(false);
        return;
      }

      const formatted = recent
        .map((m) => {
          const name =
            m.senderId === authUser._id ? authUser.fullName : "Them";
          return `${name}: ${m.message}`;
        })
        .join("\n");

      try {
        const res = await fetch("/api/ai/chat", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: `Summarize this conversation in 3-5 concise bullet points. Focus on decisions made, action items, and key info shared:\n\n${formatted}`,
            conversationHistory: [],
            provider: selectedAIProvider,
          }),
        });

        if (!res.ok) throw new Error("Failed");
        const data = await res.json();
        setSummary(data.reply || "Could not generate summary.");
      } catch {
        setSummary("Failed to generate summary. Please try again.");
      } finally {
        setLoading(false);
      }
    };

    generate();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="border-t border-gray-700/60 bg-gray-800/80 backdrop-blur-sm px-4 py-3">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <FiZap size={14} className="text-yellow-400" />
          <span className="text-sm font-semibold text-white">Catch Up</span>
          <span className="text-xs text-gray-400">
            (last {Math.min(messages.filter((m) => !m.deleted && m.messageType !== "image").length, 30)} messages)
          </span>
        </div>
        <div className="flex items-center gap-2">
          {summary && !loading && (
            <button
              onClick={() => {
                navigator.clipboard.writeText(summary);
                toast.success("Copied!");
              }}
              className="text-gray-400 hover:text-white transition-colors"
              title="Copy summary"
            >
              <FiCopy size={14} />
            </button>
          )}
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <IoClose size={16} />
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-gray-400 text-sm py-1">
          <div className="loading loading-spinner w-4 h-4" />
          <span>Summarizing conversation…</span>
        </div>
      ) : (
        <p className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
          {summary}
        </p>
      )}
    </div>
  );
};

export default ChatSummaryPanel;
