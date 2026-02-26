"use client";

import { useEffect, useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { YouTubeLiveChatMessage } from "@/types/youtube";

interface CommentListProps {
  comments: YouTubeLiveChatMessage[];
}

export function CommentList({ comments }: CommentListProps) {
  const listRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState(true);

  // 自動スクロール: 新しいコメントが追加されたら最下部へ
  useEffect(() => {
    if (autoScroll && listRef.current) {
      listRef.current.scrollTop = listRef.current.scrollHeight;
    }
  }, [comments, autoScroll]);

  // スクロール位置を監視して、ユーザーが上にスクロールしたら自動スクロールを停止
  const handleScroll = () => {
    if (!listRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 50;
    setAutoScroll(isAtBottom);
  };

  return (
    <div
      ref={listRef}
      onScroll={handleScroll}
      className="flex-1 overflow-y-auto space-y-2 p-4"
    >
      {comments.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          まだコメントがありません
        </div>
      ) : (
        comments.map((comment) => (
          <CommentItem key={comment.id} comment={comment} />
        ))
      )}
    </div>
  );
}

interface CommentItemProps {
  comment: YouTubeLiveChatMessage;
}

function CommentItem({ comment }: CommentItemProps) {
  const isSuperChat = comment.snippet.type === "superChatEvent";
  const isMember = comment.authorDetails.isChatSponsor;
  const isModerator = comment.authorDetails.isChatModerator;

  if (isSuperChat && comment.snippet.superChatDetails) {
    // スパチャ: 金色ハイライト
    return (
      <Card className="border-yellow-500 bg-gradient-to-r from-yellow-900/20 to-yellow-800/10 p-3 space-y-2">
        <div className="flex items-center gap-2">
          <img
            src={comment.authorDetails.profileImageUrl}
            alt={comment.authorDetails.displayName}
            className="w-6 h-6 rounded-full"
          />
          <span className="font-bold text-sm text-yellow-400">
            {comment.authorDetails.displayName}
          </span>
          <span className="text-yellow-300 text-sm font-semibold">
            {comment.snippet.superChatDetails.amountDisplayString}
          </span>
        </div>
        <div className="text-sm text-foreground pl-8">
          {comment.snippet.displayMessage}
        </div>
        <div className="text-xs text-muted-foreground pl-8">
          {new Date(comment.snippet.publishedAt).toLocaleTimeString("ja-JP")}
        </div>
      </Card>
    );
  }

  // 通常コメント
  return (
    <div className="flex items-start gap-2 hover:bg-accent/50 p-2 rounded">
      <img
        src={comment.authorDetails.profileImageUrl}
        alt={comment.authorDetails.displayName}
        className="w-6 h-6 rounded-full flex-shrink-0 mt-0.5"
      />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="font-bold text-sm">{comment.authorDetails.displayName}</span>
          {isMember && (
            <Badge variant="default" className="h-4 px-1 text-xs bg-blue-600">
              メンバー
            </Badge>
          )}
          {isModerator && (
            <Badge variant="default" className="h-4 px-1 text-xs bg-green-600">
              モデレーター
            </Badge>
          )}
          <span className="text-xs text-muted-foreground">
            {new Date(comment.snippet.publishedAt).toLocaleTimeString("ja-JP")}
          </span>
        </div>
        <div className="text-sm mt-0.5 break-words">
          {comment.snippet.displayMessage}
        </div>
      </div>
    </div>
  );
}
