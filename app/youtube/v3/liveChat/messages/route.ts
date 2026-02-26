import { NextRequest, NextResponse } from "next/server";
import { getRoomByLiveChatId } from "@/lib/db";
import type { YouTubeLiveChatMessageListResponse } from "@/types/youtube";

// ViNextでは Route Handler の context にバインディングが渡される想定
// 型安全性のため、context?.env を使用してバインディングにアクセス
interface Env {
  DB: D1Database;
  ROOM_OBJECT: DurableObjectNamespace;
}

export async function GET(
  request: NextRequest,
  context?: { env?: Env }
) {
  const env = context?.env;

  if (!env?.DB || !env?.ROOM_OBJECT) {
    return NextResponse.json(
      { error: { code: 500, message: "Server configuration error" } },
      { status: 500 }
    );
  }

  const searchParams = request.nextUrl.searchParams;
  const liveChatId = searchParams.get("liveChatId");
  const pageToken = searchParams.get("pageToken") || undefined;
  // part パラメータは互換性のため受け取るが無視

  if (!liveChatId) {
    return NextResponse.json(
      { error: { code: 400, message: "liveChatId is required" } },
      { status: 400 }
    );
  }

  try {
    // D1 からルームを検索（liveChatId で）
    const room = await getRoomByLiveChatId(env.DB, liveChatId);

    if (!room) {
      return NextResponse.json(
        { error: { code: 404, message: "Live chat not found" } },
        { status: 404 }
      );
    }

    // ルームの status が active でない場合は 403 (ライブチャットが無効)
    if (room.status !== "active") {
      return NextResponse.json(
        { error: { code: 403, message: "Live chat is not active" } },
        { status: 403 }
      );
    }

    // RoomObject Durable Object からコメントを取得
    const id = env.ROOM_OBJECT.idFromName(liveChatId);
    const stub = env.ROOM_OBJECT.get(id);

    // stub.fetch で内部エンドポイントをコール
    const pollUrl = pageToken
      ? `http://internal/poll?pageToken=${encodeURIComponent(pageToken)}`
      : `http://internal/poll`;
    const pollResponse = await stub.fetch(pollUrl);

    if (!pollResponse.ok) {
      throw new Error("Failed to fetch comments from Durable Object");
    }

    const result = await pollResponse.json() as {
      comments: Array<{
        id: string;
        author: string;
        authorChannelId: string;
        text: string;
        publishedAt: number;
        isMember: boolean;
        isModerator: boolean;
        superChatAmount?: number;
        superChatCurrency?: string;
      }>;
      nextPageToken: string;
    };

    // YouTube API v3 互換レスポンスを構築
    const response: YouTubeLiveChatMessageListResponse = {
      kind: "youtube#liveChatMessageListResponse",
      etag: crypto.randomUUID(),
      nextPageToken: result.nextPageToken,
      pollingIntervalMillis: 3000,
      pageInfo: {
        totalResults: result.comments.length,
        resultsPerPage: 200,
      },
      items: result.comments.map((comment) => ({
        kind: "youtube#liveChatMessage",
        etag: crypto.randomUUID(),
        id: comment.id,
        snippet: {
          type: comment.superChatAmount ? "superChatEvent" : "textMessageEvent",
          liveChatId: liveChatId,
          authorChannelId: comment.authorChannelId,
          publishedAt: new Date(comment.publishedAt).toISOString(),
          hasDisplayContent: true,
          displayMessage: comment.text,
          textMessageDetails: comment.superChatAmount
            ? undefined
            : { messageText: comment.text },
          superChatDetails: comment.superChatAmount
            ? {
                amountMicros: String(comment.superChatAmount * 1_000_000),
                currency: comment.superChatCurrency || "JPY",
                amountDisplayString: `¥${comment.superChatAmount.toLocaleString()}`,
                userComment: comment.text,
                tier: Math.min(7, Math.ceil(comment.superChatAmount / 500)),
              }
            : undefined,
        },
        authorDetails: {
          channelId: comment.authorChannelId,
          channelUrl: `https://youtube.com/channel/${comment.authorChannelId}`,
          displayName: comment.author,
          profileImageUrl: `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(comment.author)}`,
          isVerified: false,
          isChatOwner: false,
          isChatSponsor: comment.isMember,
          isChatModerator: comment.isModerator,
        },
      })),
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error("YouTube API route error:", error);
    return NextResponse.json(
      { error: { code: 500, message: "Internal server error" } },
      { status: 500 }
    );
  }
}
