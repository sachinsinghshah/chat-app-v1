import { create } from "zustand";

const useConversation = create((set, get) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) =>
    set({ selectedConversation }),
  messages: [],
  setMessages: (messages) => set({ messages }),

  // Typing indicator state
  typingUsers: {},
  setTypingUser: (userId, isTyping) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [userId]: isTyping },
    })),

  // Reply-to state
  replyTo: null,
  setReplyTo: (replyTo) => set({ replyTo }),

  // ── AI state ───────────────────────────────────────────────
  // Active provider: "groq" | "gemini" | "huggingface"
  selectedAIProvider: "groq",
  setAIProvider: (provider) => set({ selectedAIProvider: provider }),

  // Per-provider conversation history
  aiMessagesByProvider: { groq: [], gemini: [], huggingface: [] },

  // Returns messages for the active provider
  get aiMessages() {
    return get().aiMessagesByProvider[get().selectedAIProvider] || [];
  },

  setAiMessages: (messages) =>
    set((state) => ({
      aiMessagesByProvider: {
        ...state.aiMessagesByProvider,
        [state.selectedAIProvider]: messages,
      },
    })),

  addAiMessage: (msg) =>
    set((state) => {
      const provider = state.selectedAIProvider;
      return {
        aiMessagesByProvider: {
          ...state.aiMessagesByProvider,
          [provider]: [...(state.aiMessagesByProvider[provider] || []), msg],
        },
      };
    }),
}));

export default useConversation;
