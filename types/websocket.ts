import type { YouTubeLiveChatMessage } from './youtube';

export type PollingMetrics = {
  totalPolls: number;
  averageIntervalMs: number;
  lastPollAt: number;
  messageCount: number;
};

export type WSMessage =
  | { type: 'comment_added'; comment: YouTubeLiveChatMessage }
  | { type: 'session_started'; sessionId: string }
  | { type: 'session_stopped'; sessionId: string }
  | { type: 'scenario_started'; scenarioId: string }
  | { type: 'scenario_stopped' }
  | { type: 'metrics_update'; metrics: PollingMetrics };
