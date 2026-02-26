import { NextRequest, NextResponse } from "next/server";
import { getRoomById, deleteRoom } from "@/lib/db";
import { requireAuth } from "@/lib/middleware";

/**
 * Cloudflare Workers 環境の型定義
 */
interface CloudflareEnv {
  DB: D1Database;
  SESSION_KV: KVNamespace;
}

/**
 * ルーム詳細取得エンドポイント
 * 指定されたIDのルーム情報を返す
 */
export async function GET(
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

    return NextResponse.json({ room });
  } catch (error) {
    console.error("Get room error:", error);
    return NextResponse.json(
      { error: "Failed to fetch room" },
      { status: 500 }
    );
  }
}

/**
 * ルーム削除エンドポイント
 * 指定されたIDのルームを削除する
 */
export async function DELETE(
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

    // ルームを削除
    await deleteRoom(db, roomId);

    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error("Delete room error:", error);
    return NextResponse.json(
      { error: "Failed to delete room" },
      { status: 500 }
    );
  }
}
