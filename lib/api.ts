import type { Room, CreateRoomRequest } from "@/types/room";
import type { Scenario } from "@/types/scenario";

interface ApiResponse<T> {
  data?: T;
  error?: string;
}

async function parseJson<T>(response: Response): Promise<T> {
  return (await response.json()) as T;
}

export async function fetchRooms(): Promise<ApiResponse<Room[]>> {
  try {
    const response = await fetch("/api/rooms");
    if (!response.ok) {
      const body = await parseJson<{ error?: string }>(response);
      return { error: body.error || "Failed to fetch rooms" };
    }
    const body = await parseJson<{ rooms: Room[] }>(response);
    return { data: body.rooms };
  } catch {
    return { error: "Failed to fetch rooms" };
  }
}

export async function createRoom(request: CreateRoomRequest): Promise<ApiResponse<Room>> {
  try {
    const response = await fetch("/api/rooms", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(request),
    });
    if (!response.ok) {
      const body = await parseJson<{ error?: string }>(response);
      return { error: body.error || "Failed to create room" };
    }
    const body = await parseJson<{ room: Room }>(response);
    return { data: body.room };
  } catch {
    return { error: "Failed to create room" };
  }
}

export async function deleteRoom(id: string): Promise<ApiResponse<void>> {
  try {
    const response = await fetch(`/api/rooms/${id}`, { method: "DELETE" });
    if (!response.ok) {
      const body = await parseJson<{ error?: string }>(response);
      return { error: body.error || "Failed to delete room" };
    }
    return { data: undefined };
  } catch {
    return { error: "Failed to delete room" };
  }
}

export async function fetchRoom(id: string): Promise<ApiResponse<Room>> {
  try {
    const response = await fetch(`/api/rooms/${id}`);
    if (!response.ok) {
      const body = await parseJson<{ error?: string }>(response);
      return { error: body.error || "Failed to fetch room" };
    }
    const body = await parseJson<{ room: Room }>(response);
    return { data: body.room };
  } catch {
    return { error: "Failed to fetch room" };
  }
}

export async function startSession(roomId: string): Promise<ApiResponse<Room>> {
  try {
    const response = await fetch(`/api/rooms/${roomId}/start`, { method: "POST" });
    if (!response.ok) {
      const body = await parseJson<{ error?: string }>(response);
      return { error: body.error || "Failed to start session" };
    }
    const body = await parseJson<{ room: Room }>(response);
    return { data: body.room };
  } catch {
    return { error: "Failed to start session" };
  }
}

export async function stopSession(roomId: string): Promise<ApiResponse<Room>> {
  try {
    const response = await fetch(`/api/rooms/${roomId}/stop`, { method: "POST" });
    if (!response.ok) {
      const body = await parseJson<{ error?: string }>(response);
      return { error: body.error || "Failed to stop session" };
    }
    const body = await parseJson<{ room: Room }>(response);
    return { data: body.room };
  } catch {
    return { error: "Failed to stop session" };
  }
}

export async function addComment(
  roomId: string,
  comment: {
    author: string;
    text: string;
    isMember?: boolean;
    isModerator?: boolean;
    superChatAmount?: number;
    superChatCurrency?: string;
  }
): Promise<ApiResponse<unknown>> {
  try {
    const response = await fetch(`/api/rooms/${roomId}/comments`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(comment),
    });
    if (!response.ok) {
      const body = await parseJson<{ error?: string }>(response);
      return { error: body.error || "Failed to add comment" };
    }
    const result = await response.json();
    return { data: result };
  } catch {
    return { error: "Failed to add comment" };
  }
}

export async function fetchScenarios(): Promise<ApiResponse<Scenario[]>> {
  try {
    const response = await fetch("/api/scenarios");
    if (!response.ok) {
      const body = await parseJson<{ error?: string }>(response);
      return { error: body.error || "Failed to fetch scenarios" };
    }
    const body = await parseJson<{ scenarios: Scenario[] }>(response);
    return { data: body.scenarios };
  } catch {
    return { error: "Failed to fetch scenarios" };
  }
}
