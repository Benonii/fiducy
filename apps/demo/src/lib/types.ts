import type { UIMessage } from 'ai';

export interface PublicDemoConfig {
  gatewayURL: string;
  appID: string;
}

export interface ServerDemoConfig extends PublicDemoConfig {
  appSecret: string;
  model: string;
}

export interface ChatRequestBody {
  handle: string;
  messages: UIMessage[];
}

export interface GatewayErrorBody {
  message?: string;
}
