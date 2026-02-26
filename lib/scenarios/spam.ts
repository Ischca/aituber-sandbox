import type { ScenarioDefinition } from "@/types/scenario";

export const spamScenario: ScenarioDefinition = {
  name: "荒らし",
  description: "同一ユーザーが短間隔で大量のコメントを投下するシナリオ",
  duration: 60,
  events: [
    { type: "comment", at: 2, author: "視聴者A", text: "こんにちは！" },
    { type: "spam", at: 5, author: "荒らしBot", text: "wwwwwwwwww", count: 10, interval: 0.5 },
    { type: "comment", at: 12, author: "視聴者B", text: "荒らしがいるな..." },
    { type: "spam", at: 15, author: "荒らしBot", text: "あああああああ", count: 15, interval: 0.3 },
    { type: "comment", at: 25, author: "視聴者A", text: "まだ続いてる..." },
    { type: "spam", at: 30, author: "荒らしBot2", text: "spam spam spam", count: 20, interval: 0.2 },
    { type: "comment", at: 45, author: "視聴者C", text: "大丈夫？" },
    { type: "comment", at: 50, author: "視聴者B", text: "落ち着いたかな" },
  ],
};
