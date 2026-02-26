import type { Scenario } from "@/types/scenario";
import { spamScenario } from "./spam";
import { superchatRushScenario } from "./superchat-rush";
import { excitementScenario } from "./excitement";
import { quietScenario } from "./quiet";
import { promptInjectionScenario } from "./prompt-injection";

export const builtinScenarios: Scenario[] = [
  {
    id: "builtin-spam",
    name: spamScenario.name,
    category: "ストレステスト",
    createdBy: null,
    definition: spamScenario,
    createdAt: 0,
    isBuiltin: true,
  },
  {
    id: "builtin-superchat-rush",
    name: superchatRushScenario.name,
    category: "収益化テスト",
    createdBy: null,
    definition: superchatRushScenario,
    createdAt: 0,
    isBuiltin: true,
  },
  {
    id: "builtin-excitement",
    name: excitementScenario.name,
    category: "負荷テスト",
    createdBy: null,
    definition: excitementScenario,
    createdAt: 0,
    isBuiltin: true,
  },
  {
    id: "builtin-quiet",
    name: quietScenario.name,
    category: "エッジケース",
    createdBy: null,
    definition: quietScenario,
    createdAt: 0,
    isBuiltin: true,
  },
  {
    id: "builtin-prompt-injection",
    name: promptInjectionScenario.name,
    category: "セキュリティ",
    createdBy: null,
    definition: promptInjectionScenario,
    createdAt: 0,
    isBuiltin: true,
  },
];
