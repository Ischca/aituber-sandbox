import type { ScenarioDefinition } from "@/types/scenario";

export const quietScenario: ScenarioDefinition = {
  name: "閑散",
  description: "長い間隔でぽつぽつとコメントが来る閑散シナリオ",
  duration: 180,
  events: [
    { type: "comment", at: 10, author: "常連さん", text: "こんにちは" },
    { type: "comment", at: 35, author: "通りすがり", text: "初めて見ました" },
    { type: "comment", at: 70, author: "常連さん", text: "今日は静かだね" },
    { type: "comment", at: 100, author: "深夜勢", text: "こんな時間に配信してるんだ" },
    { type: "comment", at: 130, author: "常連さん", text: "まったり見てます" },
    { type: "comment", at: 160, author: "通りすがり", text: "面白いですね" },
  ],
};
