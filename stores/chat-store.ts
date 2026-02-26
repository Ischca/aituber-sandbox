import { create } from "zustand";
import type { YouTubeLiveChatMessage } from "@/types/youtube";
import type { PollingMetrics } from "@/types/websocket";

interface ChatStore {
  comments: YouTubeLiveChatMessage[];
  metrics: PollingMetrics | null;
  connected: boolean;
  addComment: (comment: YouTubeLiveChatMessage) => void;
  setComments: (comments: YouTubeLiveChatMessage[]) => void;
  setMetrics: (metrics: PollingMetrics) => void;
  setConnected: (connected: boolean) => void;
  clearComments: () => void;
}

export const useChatStore = create<ChatStore>((set) => ({
  comments: [],
  metrics: null,
  connected: false,
  addComment: (comment) =>
    set((state) => ({ comments: [...state.comments, comment] })),
  setComments: (comments) => set({ comments }),
  setMetrics: (metrics) => set({ metrics }),
  setConnected: (connected) => set({ connected }),
  clearComments: () => set({ comments: [] }),
}));
