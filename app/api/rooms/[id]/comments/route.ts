import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { devStore } from "@/lib/dev-store";

const addCommentSchema = z.object({
  author: z.string().min(1, "作成者名は必須です"),
  text: z.string().min(1, "コメント本文は必須です"),
  isMember: z.boolean().optional().default(false),
  isModerator: z.boolean().optional().default(false),
  superChatAmount: z.number().positive().optional(),
  superChatCurrency: z.string().optional().default("JPY"),
});

export async function POST(
  request: NextRequest,
  context?: { params?: { id: string } }
): Promise<NextResponse> {
  try {
    const roomId = context?.params?.id;
    if (!roomId) {
      return NextResponse.json({ error: "Room ID is required" }, { status: 400 });
    }
    const room = devStore.getRoom(roomId);
    if (!room) {
      return NextResponse.json({ error: "Room not found" }, { status: 404 });
    }

    const body = await request.json();
    const validation = addCommentSchema.safeParse(body);
    if (!validation.success) {
      return NextResponse.json(
        { error: validation.error.errors[0].message },
        { status: 400 }
      );
    }

    const comment = devStore.addComment(roomId, validation.data);
    return NextResponse.json(comment, { status: 201 });
  } catch (error) {
    console.error("Add comment error:", error);
    return NextResponse.json({ error: "Failed to add comment" }, { status: 500 });
  }
}
