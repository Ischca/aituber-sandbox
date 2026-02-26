"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { ThumbsUp, ThumbsDown, Share2, ChevronDown, ChevronUp } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StreamInfoProps {
  title: string;
  channelName: string;
  channelAvatarUrl?: string;
  description?: string;
}

export function StreamInfo({ title, channelName, channelAvatarUrl, description }: StreamInfoProps) {
  const [liked, setLiked] = useState(false);
  const [disliked, setDisliked] = useState(false);
  const [showDescription, setShowDescription] = useState(false);
  const [viewerCount, setViewerCount] = useState(() => Math.floor(Math.random() * 450) + 50);
  const [copied, setCopied] = useState(false);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // 視聴者数シミュレーション
  useEffect(() => {
    const scheduleUpdate = () => {
      const delay = (Math.random() * 10 + 5) * 1000; // 5-15秒
      timerRef.current = setTimeout(() => {
        setViewerCount(prev => {
          const delta = Math.floor(Math.random() * 21) - 10; // -10 ~ +10
          return Math.max(10, Math.min(999, prev + delta));
        });
        scheduleUpdate();
      }, delay);
    };
    scheduleUpdate();
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, []);

  const handleLike = () => {
    setLiked(!liked);
    if (disliked) setDisliked(false);
  };

  const handleDislike = () => {
    setDisliked(!disliked);
    if (liked) setLiked(false);
  };

  const handleShare = useCallback(async () => {
    await navigator.clipboard.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, []);

  const avatarUrl = channelAvatarUrl || `https://api.dicebear.com/9.x/thumbs/svg?seed=${encodeURIComponent(channelName)}`;

  return (
    <div className="space-y-3 pt-3">
      {/* タイトル */}
      <h1 className="text-lg font-semibold leading-snug">{title}</h1>

      {/* チャンネル情報 + アクション */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <img
            src={avatarUrl}
            alt={channelName}
            className="h-10 w-10 rounded-full bg-neutral-200"
          />
          <div>
            <p className="text-sm font-medium">{channelName}</p>
            <p className="text-xs text-muted-foreground">
              {viewerCount.toLocaleString()} 人が視聴中
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-full border overflow-hidden">
            <button
              onClick={handleLike}
              className={`flex items-center gap-1 px-3 py-1.5 text-sm border-r transition-colors ${liked ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              <ThumbsUp className="h-4 w-4" />
            </button>
            <button
              onClick={handleDislike}
              className={`flex items-center px-3 py-1.5 text-sm transition-colors ${disliked ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
            >
              <ThumbsDown className="h-4 w-4" />
            </button>
          </div>
          <Button variant="outline" size="sm" className="rounded-full" onClick={handleShare}>
            <Share2 className="h-4 w-4 mr-1" />
            {copied ? "コピー済み" : "共有"}
          </Button>
        </div>
      </div>

      {/* 説明欄 */}
      {description && (
        <div className="rounded-xl bg-muted/50 p-3">
          <div className={showDescription ? "" : "line-clamp-2"}>
            <p className="text-sm whitespace-pre-wrap">{description}</p>
          </div>
          <button
            onClick={() => setShowDescription(!showDescription)}
            className="text-sm font-medium text-muted-foreground hover:text-foreground mt-1 flex items-center gap-1"
          >
            {showDescription ? (
              <>一部を表示 <ChevronUp className="h-3 w-3" /></>
            ) : (
              <>もっと見る <ChevronDown className="h-3 w-3" /></>
            )}
          </button>
        </div>
      )}
    </div>
  );
}
