import useConversation from "../../../zustand/useConversation";

const SuggestedReplies = ({ onSelect }) => {
  const { suggestedReplies } = useConversation();

  if (!suggestedReplies?.length) return null;

  return (
    <div className="flex gap-2 flex-wrap px-1 mb-2">
      {suggestedReplies.map((reply, i) => (
        <button
          key={i}
          onClick={() => onSelect(reply)}
          className="text-xs bg-indigo-500/20 hover:bg-indigo-500/30 text-indigo-300 border border-indigo-500/30 hover:border-indigo-400/50 rounded-full px-3 py-1.5 transition-all truncate max-w-[200px]"
          title={reply}
        >
          {reply}
        </button>
      ))}
    </div>
  );
};

export default SuggestedReplies;
