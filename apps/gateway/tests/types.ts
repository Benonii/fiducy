export interface StoreKeyResponseBody {
  data: { handle: string };
  message: string;
}

export interface ReceivedUsageEvent {
  appID: string;
  keyID: string;
  provider: string;
  inputTokens: number;
  outputTokens: number;
  recordedAt: string;
}

export interface ReceivedUsageBatch {
  events: ReceivedUsageEvent[];
}
