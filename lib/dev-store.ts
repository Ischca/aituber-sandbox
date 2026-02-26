/**
 * ローカル開発用のインメモリストア
 * Cloudflare バインディング（D1, KV, Durable Objects）が利用できない場合のフォールバック
 */
import type { Room } from "@/types/room";
import type { YouTubeLiveChatMessage } from "@/types/youtube";

const DEV_USER_ID = "dev-user";

interface DevComment {
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

class DevStore {
  rooms: Map<string, Room> = new Map();
  comments: Map<string, DevComment[]> = new Map(); // roomId -> comments

  constructor() {
    // デフォルトルームを1つ作成
    const roomId = "dev-room-1";
    const liveChatId = "dev-live-chat-1";
    this.rooms.set(roomId, {
      id: roomId,
      ownerId: DEV_USER_ID,
      name: "テストルーム",
      liveChatId,
      status: "idle",
      createdAt: Date.now(),
      streamTitle: "テスト配信",
      channelName: "テストチャンネル",
    });
    this.comments.set(roomId, []);
  }

  getUserId(): string {
    return DEV_USER_ID;
  }

  getRooms(): Room[] {
    return Array.from(this.rooms.values());
  }

  getRoom(id: string): Room | undefined {
    return this.rooms.get(id);
  }

  getRoomByLiveChatId(liveChatId: string): Room | undefined {
    return Array.from(this.rooms.values()).find(r => r.liveChatId === liveChatId);
  }

  createRoom(name: string, options?: {
    streamUrl?: string;
    streamTitle?: string;
    channelName?: string;
    channelAvatarUrl?: string;
    description?: string;
  }): Room {
    const id = `room-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const liveChatId = `lc-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    const room: Room = {
      id,
      ownerId: DEV_USER_ID,
      name,
      liveChatId,
      status: "idle",
      createdAt: Date.now(),
      streamUrl: options?.streamUrl,
      streamTitle: options?.streamTitle,
      channelName: options?.channelName,
      channelAvatarUrl: options?.channelAvatarUrl,
      description: options?.description,
    };
    this.rooms.set(id, room);
    this.comments.set(id, []);
    return room;
  }

  updateRoom(id: string, fields: Partial<Pick<Room, 'streamUrl' | 'streamTitle' | 'channelName' | 'channelAvatarUrl' | 'description' | 'name'>>): Room | undefined {
    const room = this.rooms.get(id);
    if (!room) return undefined;
    Object.assign(room, fields);
    return room;
  }

  deleteRoom(id: string): boolean {
    this.comments.delete(id);
    return this.rooms.delete(id);
  }

  updateRoomStatus(id: string, status: Room["status"]): Room | undefined {
    const room = this.rooms.get(id);
    if (!room) return undefined;
    room.status = status;
    return room;
  }

  addComment(roomId: string, data: {
    author: string;
    text: string;
    isMember?: boolean;
    isModerator?: boolean;
    superChatAmount?: number;
    superChatCurrency?: string;
  }): DevComment {
    const comment: DevComment = {
      id: crypto.randomUUID(),
      author: data.author,
      authorChannelId: `UC${data.author.replace(/\s/g, "")}`,
      text: data.text,
      publishedAt: Date.now(),
      isMember: data.isMember || false,
      isModerator: data.isModerator || false,
      superChatAmount: data.superChatAmount,
      superChatCurrency: data.superChatCurrency || "JPY",
    };
    const comments = this.comments.get(roomId) || [];
    comments.push(comment);
    this.comments.set(roomId, comments);
    return comment;
  }

  getComments(roomId: string, afterTimestamp?: number): DevComment[] {
    const comments = this.comments.get(roomId) || [];
    if (afterTimestamp) {
      return comments.filter(c => c.publishedAt > afterTimestamp);
    }
    return comments;
  }

  getCommentCount(roomId: string): number {
    return (this.comments.get(roomId) || []).length;
  }

  toYouTubeFormat(comment: DevComment, liveChatId = ""): YouTubeLiveChatMessage {
    return {
      kind: "youtube#liveChatMessage",
      etag: "",
      id: comment.id,
      snippet: {
        type: comment.superChatAmount ? "superChatEvent" : "textMessageEvent",
        liveChatId,
        authorChannelId: comment.authorChannelId,
        publishedAt: new Date(comment.publishedAt).toISOString(),
        hasDisplayContent: true,
        displayMessage: comment.text,
        ...(comment.superChatAmount ? {
          superChatDetails: {
            amountMicros: String(comment.superChatAmount * 1_000_000),
            currency: comment.superChatCurrency || "JPY",
            amountDisplayString: `¥${comment.superChatAmount.toLocaleString()}`,
            userComment: comment.text,
            tier: Math.min(7, Math.ceil(comment.superChatAmount / 500)),
          },
        } : {
          textMessageDetails: { messageText: comment.text },
        }),
      },
      authorDetails: {
        channelId: comment.authorChannelId,
        channelUrl: `https://youtube.com/channel/${comment.authorChannelId}`,
        displayName: comment.author,
        profileImageUrl: `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(comment.author)}`,
        isVerified: false,
        isChatModerator: comment.isModerator,
        isChatOwner: false,
        isChatSponsor: comment.isMember,
      },
    };
  }
}

// シングルトン
export const devStore = new DevStore();
