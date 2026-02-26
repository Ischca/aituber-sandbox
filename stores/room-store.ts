import { create } from "zustand";
import type { Room } from "@/types/room";

interface RoomStore {
  rooms: Room[];
  loading: boolean;
  setRooms: (rooms: Room[]) => void;
  addRoom: (room: Room) => void;
  removeRoom: (id: string) => void;
  updateRoom: (id: string, updates: Partial<Room>) => void;
  setLoading: (loading: boolean) => void;
}

export const useRoomStore = create<RoomStore>((set) => ({
  rooms: [],
  loading: true,
  setRooms: (rooms) => set({ rooms }),
  addRoom: (room) => set((state) => ({ rooms: [...state.rooms, room] })),
  removeRoom: (id) => set((state) => ({ rooms: state.rooms.filter(r => r.id !== id) })),
  updateRoom: (id, updates) => set((state) => ({
    rooms: state.rooms.map(r => r.id === id ? { ...r, ...updates } : r),
  })),
  setLoading: (loading) => set({ loading }),
}));
