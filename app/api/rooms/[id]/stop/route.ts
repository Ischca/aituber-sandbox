import { NextRequest, NextResponse } from "next/server";
import { getRoomById, updateRoomStatus } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";

/**
 * Cloudflare Workers 環境の型定義
 */
interface CloudflareEnv {
  DB: D1Database;
  SESSION_KV: KVNamespace;
}

/**
 * セッション停止エンドポイント
 * ルームのステータスを stopped に変更する
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

    if (!db || !sessionKv) {
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

    // すでに stopped の場合はエラー
    if (room.status === "stopped") {
      return NextResponse.json(
        { error: "Room is already stopped" },
        { status: 400 }
      );
    }

    // ステータスを stopped に変更
    const updatedRoom = await updateRoomStatus(db, roomId, "stopped");

    return NextResponse.json({ room: updatedRoom });
  } catch (error) {
    console.error("Stop session error:", error);
    return NextResponse.json(
      { error: "Failed to stop session" },
      { status: 500 }
    );
  }
}
