export type RoomStatus = 'idle' | 'active' | 'stopped';

export interface Room {
  id: string;
  ownerId: string;
  name: string;
  liveChatId: string;
  status: RoomStatus;
  createdAt: number;
}

export interface RoomSession {
  id: string;
  roomId: string;
  startedAt: number;
  endedAt?: number;
  messageCount: number;
  pollingCount: number;
}

export interface CreateRoomRequest {
  name: string;
}
