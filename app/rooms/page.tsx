import { RoomListClient } from "@/components/room/room-list";

export default async function RoomsPage() {
  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">ルーム</h1>
          <p className="text-muted-foreground">テスト用チャットルームを管理</p>
        </div>
      </div>
      <RoomListClient />
    </div>
  );
}
