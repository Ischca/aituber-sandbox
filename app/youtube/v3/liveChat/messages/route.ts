import { NextRequest, NextResponse } from "next/server";
import { devStore } from "@/lib/dev-store";
import type { YouTubeLiveChatMessageListResponse } from "@/types/youtube";

export async function GET(request: NextRequest) {
  const url = new URL(request.url);
  const liveChatId = url.searchParams.get("liveChatId");
  const pageToken = url.searchParams.get("pageToken") || undefined;

  if (!liveChatId) {
    return NextResponse.json(
      { error: { code: 400, message: "liveChatId is required" } },
      { status: 400 }
    );
  }

  try {
    const room = devStore.getRoomByLiveChatId(liveChatId);
    if (!room) {
      return NextResponse.json(
        { error: { code: 404, message: "Live chat not found" } },
        { status: 404 }
      );
    }

    if (room.status !== "active") {
      return NextResponse.json(
        { error: { code: 403, message: "Live chat is not active" } },
        { status: 403 }
      );
    }

    // pageToken はタイムスタンプの base64
    const afterTimestamp = pageToken ? parseInt(atob(pageToken), 10) : 0;
    const comments = devStore.getComments(room.id, afterTimestamp || undefined);
    const nextPageToken = comments.length > 0
      ? btoa(String(comments[comments.length - 1].publishedAt))
      : pageToken || btoa("0");

    const response: YouTubeLiveChatMessageListResponse = {
      kind: "youtube#liveChatMessageListResponse",
      etag: crypto.randomUUID(),
      nextPageToken,
      pollingIntervalMillis: 3000,
      pageInfo: {
        totalResults: comments.length,
        resultsPerPage: 200,
      },
      items: comments.map((comment) => ({
        kind: "youtube#liveChatMessage",
        etag: crypto.randomUUID(),
        id: comment.id,
        snippet: {
          type: comment.superChatAmount ? "superChatEvent" : "textMessageEvent",
          liveChatId,
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
