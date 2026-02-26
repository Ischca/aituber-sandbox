import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { devStore } from "@/lib/dev-store";

const createRoomSchema = z.object({
  name: z.string().min(1, "名前は必須です").max(50, "名前は50文字以内です"),
  streamUrl: z.string().url().optional(),
  streamTitle: z.string().max(200).optional(),
  channelName: z.string().max(100).optional(),
  channelAvatarUrl: z.string().url().optional(),
  description: z.string().max(5000).optional(),
});

export async function GET(request: NextRequest): Promise<NextResponse> {
  // liveChatId による単一ルーム検索
  const url = new URL(request.url);
  const liveChatId = url.searchParams.get("liveChatId");
  if (liveChatId) {
    const room = devStore.getRoomByLiveChatId(liveChatId);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    const commentCount = devStore.getCommentCount(room.id);
    return NextResponse.json({ room: { ...room, commentCount } });
  }

  const rooms = devStore.getRooms();
  const roomsWithCount = rooms.map(room => ({
    ...room,
    commentCount: devStore.getCommentCount(room.id),
  }));
  return NextResponse.json({ rooms: roomsWithCount });
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const validation = createRoomSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    const { name, ...options } = validation.data;
    const room = devStore.createRoom(name, options);
    return NextResponse.json({ room }, { status: 201 });
  } catch (error) {
    console.error("Create room error:", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
