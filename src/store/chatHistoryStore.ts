import { create } from "zustand";

interface ChatHistory {
  _id: string;
  book_link: string;
  SessionId: string;
}

interface ChatHistoryState {
  chatHistory: ChatHistory[];
  isLoading: boolean;
  fetchChatHistory: (sessionId: string) => Promise<void>;
}

export const useChatHistoryStore = create<ChatHistoryState>((set) => ({
  chatHistory: [],
  isLoading: false,
  fetchChatHistory: async (sessionId: string) => {
    try {
      set({ isLoading: true });
      const response = await fetch(`/api/chat?sessionId=${sessionId}`);
      const data = await response.json();
      if (data.success) {
        set({ chatHistory: data.chatHistory || [] });
      }
    } catch (error) {
      console.error("Error fetching chat history:", error);
    } finally {
      set({ isLoading: false });
    }
  },
}));
