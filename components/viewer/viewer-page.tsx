"use client";

import { VideoPlayer } from "./video-player";
import { StreamInfo } from "./stream-info";
import { ViewerChatPanel } from "./viewer-chat-panel";
import { DEFAULT_STREAM_URL } from "@/lib/constants";
import type { Room } from "@/types/room";

interface ViewerPageProps {
  room: Room;
}

export function ViewerPage({ room }: ViewerPageProps) {
  const streamUrl = room.streamUrl || DEFAULT_STREAM_URL;
  const title = room.streamTitle || room.name;
  const channelName = room.channelName || "チャンネル名未設定";

  return (
    <div className="grid grid-cols-1 lg:grid-cols-[1fr_400px] gap-0 lg:gap-4 h-[calc(100vh-48px)]">
      {/* 左カラム: 動画 + 配信情報 */}
      <div className="flex flex-col min-h-0 overflow-y-auto">
        <VideoPlayer streamUrl={streamUrl} />
        <div className="px-4 pb-6">
          <StreamInfo
            title={title}
            channelName={channelName}
            channelAvatarUrl={room.channelAvatarUrl}
            description={room.description}
          />
        </div>
      </div>

      {/* 右カラム: チャット */}
      <div className="h-full min-h-0 lg:py-0 px-4 lg:px-0 pb-4 lg:pb-0">
        <ViewerChatPanel roomId={room.id} liveChatId={room.liveChatId} />
      </div>
    </div>
  );
}
