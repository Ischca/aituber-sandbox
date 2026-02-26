import { NextRequest, NextResponse } from "next/server";
import { devStore } from "@/lib/dev-store";

export async function POST(
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
  if (room.status === "stopped") {
    return NextResponse.json({ error: "Room is already stopped" }, { status: 400 });
  }
  const updated = devStore.updateRoomStatus(roomId, "stopped");
  return NextResponse.json({ room: updated });
}
