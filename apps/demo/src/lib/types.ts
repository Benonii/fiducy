import type { FrontendTools } from '@assistant-ui/react-ai-sdk';
import type { GatewayProvider } from '@fiducy/sdk/react';
import type { UIMessage } from 'ai';

export interface PublicDemoEnvironment {
  FIDUCY_APP_ID: string;
  FIDUCY_GATEWAY_URL: string;
}

export interface DemoModel {
  id: string;
  label: string;
  provider: GatewayProvider;
}

export interface ChatRequestBody {
  messages: UIMessage[];
  tools?: FrontendTools;
  model?: string;
}

export interface GatewayErrorBody {
  message?: string;
}
