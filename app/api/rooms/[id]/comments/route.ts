import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRoomById } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";

/**
 * Cloudflare Workers 環境の型定義
 */
interface CloudflareEnv {
  DB: D1Database;
  SESSION_KV: KVNamespace;
  ROOM_OBJECT: DurableObjectNamespace;
}

/**
 * コメント追加リクエストのバリデーションスキーマ
 */
const addCommentSchema = z.object({
  author: z.string().min(1, "作成者名は必須です"),
  text: z.string().min(1, "コメント本文は必須です"),
  isMember: z.boolean().optional().default(false),
  isModerator: z.boolean().optional().default(false),
  superChatAmount: z.number().positive().optional(),
  superChatCurrency: z.string().optional().default("JPY"),
});

/**
 * コメント追加エンドポイント
 * Durable Object の RoomObject にコメントを送信する
 */
export async function POST(
  request: NextRequest,
  context?: { params?: { id: string }; env?: CloudflareEnv }
): Promise<NextResponse> {
  try {
    const roomId = context?.params?.id;
    if (!roomId) {
      return NextResponse.json(
        { error: "Room ID is required" },
        { status: 400 }
      );
    }

    // 環境変数の取得
    const db = context?.env?.DB;
    const sessionKv = context?.env?.SESSION_KV;
    const roomObject = context?.env?.ROOM_OBJECT;

    if (!db || !sessionKv || !roomObject) {
      return NextResponse.json(
        { error: "Environment not configured" },
        { status: 500 }
      );
    }

    // 認証チェック
    const userId = await requireAuth(request, sessionKv);
    if (!userId) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // リクエストボディの取得とバリデーション
    const body = await request.json();
    const validation = addCommentSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    // ルームを取得
    const room = await getRoomById(db, roomId);
    if (!room) {
      return NextResponse.json(
        { error: "Room not found" },
        { status: 404 }
      );
    }

    // オーナーチェック
    if (room.ownerId !== String(userId)) {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      );
    }

    // Durable Object にコメントを送信
    const id = roomObject.idFromName(room.liveChatId);
    const stub = roomObject.get(id);

    const commentData = {
      ...validation.data,
      timestamp: Date.now(),
    };

    const doResponse = await stub.fetch(
      new Request("http://internal/comments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(commentData),
      })
    );

    if (!doResponse.ok) {
      const errorText = await doResponse.text();
      console.error("Durable Object error:", errorText);
      return NextResponse.json(
        { error: "Failed to add comment to room" },
        { status: 500 }
      );
    }

    const result = await doResponse.json();

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    console.error("Add comment error:", error);
    return NextResponse.json(
      { error: "Failed to add comment" },
      { status: 500 }
    );
  }
}
