import { create } from "zustand";

const useConversation = create((set, get) => ({
  selectedConversation: null,
  setSelectedConversation: (selectedConversation) =>
    set({ selectedConversation }),

  messages: [],
  setMessages: (messages) => set({ messages }),

  // Update a single message in the messages list (edit / delete / react)
  updateMessage: (messageId, updates) =>
    set((state) => ({
      messages: state.messages.map((m) =>
        m._id === messageId ? { ...m, ...updates } : m
      ),
    })),

  // ── Sidebar conversations (enriched with lastMessage + unreadCount) ──────
  conversations: [],
  setConversations: (conversations) => set({ conversations }),

  // Update lastMessage / unreadCount for a single conversation
  updateConversationMeta: (userId, lastMessage, incrementUnread = false) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c._id === userId
          ? {
              ...c,
              lastMessage,
              unreadCount: incrementUnread ? (c.unreadCount || 0) + 1 : c.unreadCount,
            }
          : c
      ),
    })),

  clearUnread: (userId) =>
    set((state) => ({
      conversations: state.conversations.map((c) =>
        c._id === userId ? { ...c, unreadCount: 0 } : c
      ),
    })),

  // ── Group chats ──────────────────────────────────────────────────────────
  groups: [],
  setGroups: (groups) => set({ groups }),
  addGroup: (group) =>
    set((state) => ({
      groups: [group, ...state.groups.filter((g) => g._id !== group._id)],
    })),
  updateGroupMeta: (groupId, lastMessage, incrementUnread = false) =>
    set((state) => ({
      groups: state.groups.map((g) =>
        g._id === groupId
          ? {
              ...g,
              lastMessage,
              unreadCount: incrementUnread ? (g.unreadCount || 0) + 1 : g.unreadCount,
            }
          : g
      ),
    })),
  clearGroupUnread: (groupId) =>
    set((state) => ({
      groups: state.groups.map((g) =>
        g._id === groupId ? { ...g, unreadCount: 0 } : g
      ),
    })),

  // ── Typing ───────────────────────────────────────────────────────────────
  typingUsers: {},
  setTypingUser: (userId, isTyping) =>
    set((state) => ({
      typingUsers: { ...state.typingUsers, [userId]: isTyping },
    })),

  // ── Reply-to ─────────────────────────────────────────────────────────────
  replyTo: null,
  setReplyTo: (replyTo) => set({ replyTo }),

  // ── Blocked users ────────────────────────────────────────────────────────
  blockedUsers: [],
  setBlockedUsers: (ids) => set({ blockedUsers: ids }),
  addBlocked: (id) =>
    set((state) => ({ blockedUsers: [...new Set([...state.blockedUsers, id])] })),
  removeBlocked: (id) =>
    set((state) => ({ blockedUsers: state.blockedUsers.filter((b) => b !== id) })),

  // ── Theme ────────────────────────────────────────────────────────────────
  theme: localStorage.getItem("chatify-theme") || "dark",
  setTheme: (theme) => {
    localStorage.setItem("chatify-theme", theme);
    document.documentElement.setAttribute("data-theme", theme);
    set({ theme });
  },

  // ── AI ───────────────────────────────────────────────────────────────────
  selectedAIProvider: "groq",
  setAIProvider: (provider) => set({ selectedAIProvider: provider }),

  aiMessagesByProvider: { groq: [], gemini: [], huggingface: [] },

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
