import type { YouTubeLiveChatMessage } from "@/types/youtube";

export interface CommentResponse {
  id: string;
  author: string;
  authorChannelId: string;
  text: string;
  publishedAt: number;
  isMember: boolean;
  isModerator: boolean;
  superChatAmount?: number;
  superChatCurrency?: string;
}

export function toYouTubeMessage(data: CommentResponse, liveChatId: string): YouTubeLiveChatMessage {
  return {
    kind: "youtube#liveChatMessage",
    etag: "",
    id: data.id,
    snippet: {
      type: data.superChatAmount ? "superChatEvent" : "textMessageEvent",
      liveChatId,
      authorChannelId: data.authorChannelId,
      publishedAt: new Date(data.publishedAt).toISOString(),
      hasDisplayContent: true,
      displayMessage: data.text,
      ...(data.superChatAmount
        ? {
            superChatDetails: {
              amountMicros: String(data.superChatAmount * 1_000_000),
              currency: data.superChatCurrency || "JPY",
              amountDisplayString: `¥${data.superChatAmount.toLocaleString()}`,
              userComment: data.text,
              tier: Math.min(7, Math.ceil(data.superChatAmount / 500)),
            },
          }
        : {
            textMessageDetails: { messageText: data.text },
          }),
    },
    authorDetails: {
      channelId: data.authorChannelId,
      channelUrl: `https://youtube.com/channel/${data.authorChannelId}`,
      displayName: data.author,
      profileImageUrl: `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(data.author)}`,
      isVerified: false,
      isChatOwner: false,
      isChatSponsor: data.isMember,
      isChatModerator: data.isModerator,
    },
  };
}
