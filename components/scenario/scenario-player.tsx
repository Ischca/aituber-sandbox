"use client";

import { useState, useEffect, useRef } from "react";
import type { Scenario, ScenarioEvent } from "@/types/scenario";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Play, Pause, Square, Clock, ListChecks } from "lucide-react";
import { addComment } from "@/lib/api";

interface ScenarioPlayerProps {
  roomId: string;
  scenario: Scenario;
  onStop: () => void;
}

/**
 * シナリオプレイヤー
 * クライアントサイドでイベントを発火する
 */
export function ScenarioPlayer({ roomId, scenario, onStop }: ScenarioPlayerProps) {
  const [playing, setPlaying] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [eventIndex, setEventIndex] = useState(0);
  const [completedEvents, setCompletedEvents] = useState(0);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const eventTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { definition } = scenario;
  const progress = (elapsed / definition.duration) * 100;
  const remainingEvents = definition.events.length - completedEvents;

  useEffect(() => {
    return () => {
      // クリーンアップ
      if (timerRef.current) clearInterval(timerRef.current);
      if (eventTimerRef.current) clearTimeout(eventTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (!playing) return;

    // 1秒ごとに経過時間を更新
    timerRef.current = setInterval(() => {
      setElapsed((prev) => {
        const next = prev + 1;
        if (next >= definition.duration) {
          handleComplete();
          return definition.duration;
        }
        return next;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [playing, definition.duration]);

  useEffect(() => {
    if (!playing) return;

    // 次のイベントをチェック
    checkAndFireEvents();
  }, [elapsed, playing]);

  async function checkAndFireEvents() {
    const events = definition.events;
    let index = eventIndex;

    // elapsed に達したイベントを全て発火
    while (index < events.length && events[index].at <= elapsed) {
      const event = events[index];
      await fireEvent(event);
      index++;
      setEventIndex(index);
      setCompletedEvents(index);
    }
  }

  async function fireEvent(event: ScenarioEvent) {
    try {
      switch (event.type) {
        case "comment":
          await addComment(roomId, {
            author: event.author,
            text: event.text,
            isMember: event.isMember || false,
          });
          break;

        case "superchat":
          await addComment(roomId, {
            author: event.author,
            text: event.text,
            superChatAmount: event.amount,
            superChatCurrency: "JPY",
          });
          break;

        case "spam":
          // スパムイベント: count 回繰り返し、interval 間隔で送信
          for (let i = 0; i < event.count; i++) {
            await addComment(roomId, {
              author: event.author,
              text: event.text,
              isMember: false,
            });
            if (i < event.count - 1) {
              await sleep(event.interval);
            }
          }
          break;

        case "burst":
          // バーストイベント: authors/texts を interval 間隔で順次送信
          const length = Math.min(event.authors.length, event.texts.length);
          for (let i = 0; i < length; i++) {
            await addComment(roomId, {
              author: event.authors[i],
              text: event.texts[i],
              isMember: false,
            });
            if (i < length - 1) {
              await sleep(event.interval);
            }
          }
          break;
      }
    } catch (error) {
      console.error("Failed to fire event:", event, error);
    }
  }

  function sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  function handlePlay() {
    setPlaying(true);
  }

  function handlePause() {
    setPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function handleComplete() {
    setPlaying(false);
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }

  function handleReset() {
    handlePause();
    setElapsed(0);
    setEventIndex(0);
    setCompletedEvents(0);
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-base">シナリオ再生</CardTitle>
          <Badge variant={playing ? "default" : "secondary"}>
            {playing ? "再生中" : "停止"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h4 className="font-medium text-sm mb-1">{scenario.name}</h4>
          <p className="text-xs text-muted-foreground">{scenario.definition.description}</p>
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>
              {elapsed}秒 / {definition.duration}秒
            </span>
            <span>{Math.floor(progress)}%</span>
          </div>
          <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span>残り {definition.duration - elapsed}秒</span>
          </div>
          <div className="flex items-center gap-1.5 text-muted-foreground">
            <ListChecks className="h-3.5 w-3.5" />
            <span>残り {remainingEvents}イベント</span>
          </div>
        </div>

        <div className="flex gap-2">
          {!playing ? (
            <Button onClick={handlePlay} className="flex-1" disabled={elapsed >= definition.duration}>
              <Play className="h-4 w-4 mr-1" />
              再生
            </Button>
          ) : (
            <Button onClick={handlePause} variant="secondary" className="flex-1">
              <Pause className="h-4 w-4 mr-1" />
              一時停止
            </Button>
          )}
          <Button onClick={handleReset} variant="outline" className="flex-1">
            <Square className="h-4 w-4 mr-1" />
            リセット
          </Button>
        </div>

        <Button onClick={onStop} variant="ghost" className="w-full text-xs">
          シナリオ選択に戻る
        </Button>
      </CardContent>
    </Card>
  );
}
