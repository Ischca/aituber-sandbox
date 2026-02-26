// RoomObject を re-export（wrangler がクラスを発見するために必要）
export { RoomObject } from "./room-object";

// ViNext がデフォルトエクスポートを処理するため、
// ここでは RoomObject の named export だけを行う
//
// WebSocket ルーティング（/ws/rooms/:id）は、
// Route Handler か middleware で処理する方針
