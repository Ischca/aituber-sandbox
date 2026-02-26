"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { Volume2, VolumeX, Maximize, Loader2 } from "lucide-react";

interface VideoPlayerProps {
  streamUrl: string;
}

export function VideoPlayer({ streamUrl }: VideoPlayerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const hlsRef = useRef<import("hls.js").default | null>(null);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [status, setStatus] = useState<"loading" | "playing" | "waiting" | "error">("waiting");
  const [muted, setMuted] = useState(true);
  const [showControls, setShowControls] = useState(false);

  const attachHls = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;

    // Safari: ネイティブHLSサポート
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = streamUrl;
      video.muted = true;
      video.play().catch(() => {});
      setStatus("playing");
      return;
    }

    const { default: Hls } = await import("hls.js");

    if (!Hls.isSupported()) {
      setStatus("error");
      return;
    }

    // 既存インスタンスを破棄
    if (hlsRef.current) {
      hlsRef.current.destroy();
    }

    const hls = new Hls({
      enableWorker: true,
      lowLatencyMode: true,
    });
    hlsRef.current = hls;

    hls.loadSource(streamUrl);
    hls.attachMedia(video);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      setStatus("playing");
      video.muted = true;
      video.play().catch(() => {});
    });

    hls.on(Hls.Events.ERROR, (_event, data) => {
      if (data.fatal) {
        setStatus("error");
        hls.destroy();
        hlsRef.current = null;
        // 5秒後にリトライ
        retryTimerRef.current = setTimeout(() => {
          setStatus("loading");
          attachHls();
        }, 5000);
      }
    });

    setStatus("loading");
  }, [streamUrl]);

  useEffect(() => {
    attachHls();
    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, [attachHls]);

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const toggleFullscreen = () => {
    const container = containerRef.current;
    if (!container) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      container.requestFullscreen();
    }
  };

  return (
    <div
      ref={containerRef}
      className="relative aspect-video bg-black rounded-xl overflow-hidden group"
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => setShowControls(false)}
    >
      <video
        ref={videoRef}
        className="w-full h-full object-contain"
        playsInline
        muted={muted}
      />

      {/* LIVE バッジ */}
      {status === "playing" && (
        <div className="absolute top-3 left-3 bg-red-600 text-white text-xs font-bold px-2 py-0.5 rounded">
          LIVE
        </div>
      )}

      {/* 配信待機中プレースホルダー */}
      {(status === "waiting" || status === "error") && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-neutral-900 text-neutral-400">
          <Loader2 className="h-8 w-8 animate-spin mb-3" />
          <p className="text-sm">
            {status === "error" ? "配信に接続できません。再接続中..." : "配信待機中..."}
          </p>
        </div>
      )}

      {status === "loading" && (
        <div className="absolute inset-0 flex items-center justify-center bg-black/50">
          <Loader2 className="h-8 w-8 animate-spin text-white" />
        </div>
      )}

      {/* コントロール */}
      {status === "playing" && (
        <div
          className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-3 flex items-center justify-end gap-2 transition-opacity ${showControls ? "opacity-100" : "opacity-0"}`}
        >
          <button
            onClick={toggleMute}
            className="text-white hover:text-white/80 p-1"
          >
            {muted ? <VolumeX className="h-5 w-5" /> : <Volume2 className="h-5 w-5" />}
          </button>
          <button
            onClick={toggleFullscreen}
            className="text-white hover:text-white/80 p-1"
          >
            <Maximize className="h-5 w-5" />
          </button>
        </div>
      )}
    </div>
  );
}
