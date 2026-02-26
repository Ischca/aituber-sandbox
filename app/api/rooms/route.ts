import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getRoomsByOwnerId, createRoom } from "@/lib/db";
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
 * ルーム作成リクエストのバリデーションスキーマ
 */
const createRoomSchema = z.object({
  name: z.string().min(1, "名前は必須です").max(50, "名前は50文字以内です"),
});

/**
 * ルーム一覧取得エンドポイント
 * 認証ユーザーが所有するルームの一覧を返す
 */
export async function GET(
  request: NextRequest,
  context?: { env?: CloudflareEnv }
): Promise<NextResponse> {
  try {
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

    // ユーザーのルーム一覧を取得
    const rooms = await getRoomsByOwnerId(db, String(userId));

    return NextResponse.json({ rooms });
  } catch (error) {
    console.error("Get rooms error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

/**
 * ルーム作成エンドポイント
 * 新しいルームを作成し、liveChatId を自動生成する
 */
export async function POST(
  request: NextRequest,
  context?: { env?: CloudflareEnv }
): Promise<NextResponse> {
  try {
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

    // リクエストボディの取得とバリデーション
    const body = await request.json();
    const validation = createRoomSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const { name } = validation.data;

    // ルームIDとliveChatIDを生成
    const roomId = crypto.randomUUID();
    const liveChatId = crypto.randomUUID();

    // D1にルームを作成
    const room = await createRoom(db, {
      id: roomId,
      ownerId: String(userId),
      name,
      liveChatId,
    });

    return NextResponse.json({ room }, { status: 201 });
  } catch (error) {
    console.error("Create room error:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}
