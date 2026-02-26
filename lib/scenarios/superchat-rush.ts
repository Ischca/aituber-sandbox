import type { ScenarioDefinition } from "@/types/scenario";

export const superchatRushScenario: ScenarioDefinition = {
  name: "スパチャ連打",
  description: "複数ユーザーがスーパーチャットを連続で投下するシナリオ",
  duration: 90,
  events: [
    { type: "comment", at: 2, author: "リスナー1", text: "配信楽しみ！" },
    { type: "superchat", at: 5, author: "太客A", text: "頑張って！", amount: 500 },
    { type: "comment", at: 8, author: "リスナー2", text: "スパチャきた！" },
    { type: "superchat", at: 10, author: "太客B", text: "応援してます！", amount: 1000 },
    { type: "superchat", at: 13, author: "太客C", text: "最高！", amount: 5000 },
    { type: "comment", at: 15, author: "リスナー3", text: "すごいスパチャの嵐だ" },
    { type: "superchat", at: 18, author: "太客A", text: "もう一回！", amount: 2000 },
    { type: "superchat", at: 20, author: "太客D", text: "推しです！", amount: 10000 },
    { type: "comment", at: 22, author: "リスナー1", text: "万スパ！？" },
    { type: "superchat", at: 25, author: "太客E", text: "いつもありがとう", amount: 50000 },
    { type: "comment", at: 28, author: "リスナー2", text: "5万スパチャ！！！" },
    { type: "superchat", at: 35, author: "太客B", text: "負けてられない", amount: 10000 },
    { type: "superchat", at: 40, author: "太客C", text: "ラストスパチャ", amount: 3000 },
    { type: "comment", at: 50, author: "リスナー3", text: "落ち着いてきた" },
    { type: "comment", at: 60, author: "リスナー1", text: "すごい配信だった" },
  ],
};
