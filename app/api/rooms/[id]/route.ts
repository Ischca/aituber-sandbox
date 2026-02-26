import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { devStore } from "@/lib/dev-store";

export async function GET(
  _request: NextRequest,
  context?: { params?: { id: string } }
): Promise<NextResponse> {
  const roomId = context?.params?.id;
  if (!roomId) {
    return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
  }
  const room = devStore.getRoom(roomId);
  if (!room) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  const commentCount = devStore.getCommentCount(roomId);
  return NextResponse.json({ room: { ...room, commentCount } });
}

const updateRoomSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  streamUrl: z.string().url().optional().or(z.literal("")),
  streamTitle: z.string().max(200).optional(),
  channelName: z.string().max(100).optional(),
  channelAvatarUrl: z.string().url().optional().or(z.literal("")),
  description: z.string().max(5000).optional(),
});

export async function PATCH(
  request: NextRequest,
  context?: { params?: { id: string } }
): Promise<NextResponse> {
  const roomId = context?.params?.id;
  if (!roomId) {
    return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
  }
  try {
    const body = await request.json();
    const validation = updateRoomSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }
    const room = devStore.updateRoom(roomId, validation.data);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }
    return NextResponse.json({ room });
  } catch (error) {
    console.error("Update room error:", error);
    return NextResponse.json({ error: "Failed to update room" }, { status: 500 });
  }
}

export async function DELETE(
  _request: NextRequest,
  context?: { params?: { id: string } }
): Promise<NextResponse> {
  const roomId = context?.params?.id;
  if (!roomId) {
    return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
  }
  const deleted = devStore.deleteRoom(roomId);
  if (!deleted) {
    return NextResponse.json({ error: "Room not found" }, { status: 404 });
  }
  return new NextResponse(null, { status: 204 });
}
