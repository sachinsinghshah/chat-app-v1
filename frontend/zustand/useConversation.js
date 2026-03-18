import { create } from "zustand";

const useConversation = create((set) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) =>
    set({ selectedConversation }),
  messages: [],
  setMessages: (messages) => set({ messages }),

  // Typing indicator state
  typingUsers: {}, // { [userId]: boolean }
  setTypingUser: (userId, isTyping) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [userId]: isTyping },
    })),

  // Reply-to state
  replyTo: null,
  setReplyTo: (replyTo) => set({ replyTo }),

  // AI conversation history
  aiMessages: [],
  setAiMessages: (aiMessages) => set({ aiMessages }),
  addAiMessage: (msg) =>
    set((state) => ({ aiMessages: [...state.aiMessages, msg] })),
}));

export default useConversation;
