import type { ScenarioDefinition } from "@/types/scenario";

export const excitementScenario: ScenarioDefinition = {
  name: "盛り上がり",
  description: "多数のユーザーが活発にコメントする盛り上がりシナリオ",
  duration: 120,
  events: [
    { type: "comment", at: 1, author: "ファンA", text: "キター！" },
    { type: "comment", at: 2, author: "ファンB", text: "待ってました！" },
    { type: "comment", at: 3, author: "ファンC", text: "こんばんは！" },
    { type: "burst", at: 5, authors: ["視聴者1", "視聴者2", "視聴者3", "視聴者4", "視聴者5"], texts: ["わこつ！", "こんちわ！", "来たよ！", "こんばんは〜", "やっほー"], interval: 0.3 },
    { type: "comment", at: 10, author: "ファンA", text: "今日は何するの？" },
    { type: "comment", at: 12, author: "ファンD", text: "楽しみ！" },
    { type: "burst", at: 15, authors: ["視聴者6", "視聴者7", "視聴者8", "視聴者9", "視聴者10"], texts: ["888888", "かわいい！", "すごい！", "www", "面白い！"], interval: 0.2 },
    { type: "superchat", at: 20, author: "ファンB", text: "盛り上がってる！", amount: 500 },
    { type: "comment", at: 22, author: "ファンC", text: "それなwww" },
    { type: "burst", at: 25, authors: ["視聴者1", "視聴者3", "視聴者5", "視聴者7", "視聴者9"], texts: ["wwwwww", "草", "笑った", "最高", "神回"], interval: 0.1 },
    { type: "comment", at: 30, author: "ファンE", text: "初見です！" },
    { type: "comment", at: 32, author: "ファンA", text: "初見さんいらっしゃい！" },
    { type: "burst", at: 40, authors: ["視聴者2", "視聴者4", "視聴者6", "視聴者8", "視聴者10"], texts: ["かわいい", "天才", "すご", "やば", "最高かよ"], interval: 0.15 },
    { type: "comment", at: 50, author: "ファンD", text: "今日一番面白い" },
    { type: "superchat", at: 55, author: "ファンE", text: "ハマりました！", amount: 1000 },
    { type: "comment", at: 60, author: "ファンC", text: "まだまだ盛り上がるぞ" },
  ],
};
