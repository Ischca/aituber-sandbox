export type ScenarioDefinition = {
  name: string;
  description: string;
  duration: number; // 秒
  events: ScenarioEvent[];
};

export type ScenarioEvent =
  | { type: 'comment'; at: number; author: string; text: string; isMember?: boolean }
  | { type: 'superchat'; at: number; author: string; text: string; amount: number }
  | { type: 'spam'; at: number; author: string; text: string; count: number; interval: number }
  | { type: 'burst'; at: number; authors: string[]; texts: string[]; interval: number };

export type Scenario = {
  id: string;
  name: string;
  category: string;
  createdBy: string | null;
  definition: ScenarioDefinition;
  createdAt: number;
  isBuiltin: boolean;
};
