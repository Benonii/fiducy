import {
  AssistantRuntimeProvider,
  AuiConfig,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadListItemPrimitive,
  ThreadListPrimitive,
  ThreadPrimitive,
  Tools
} from '@assistant-ui/react';
import { AssistantChatTransport, useChatRuntime } from '@assistant-ui/react-ai-sdk';
import { PROVIDER_LABELS, fiducyToolkit } from '@fiducy/assistant-ui';
import { useFiducyKeys } from '@fiducy/sdk/react';
import { lastAssistantMessageIsCompleteWithToolCalls } from 'ai';
import { useMemo, useRef, useState } from 'react';

import { CHAT_API_PATH, DEFAULT_MODEL_ID, DEMO_MODELS, FIDUCY_BASE_PATH } from '../lib/constants';
import { SUGGESTIONS } from '../lib/constants';
import { KeysPanel } from './KeysPanel';

import type { PublicDemoConfig } from '../lib/types';

function ThreadListItem() {
  return (
    <ThreadListItemPrimitive.Root className="thread-item">
      <ThreadListItemPrimitive.Trigger className="thread-item-trigger">
        <ThreadListItemPrimitive.Title fallback="New chat" />
      </ThreadListItemPrimitive.Trigger>
    </ThreadListItemPrimitive.Root>
  );
}

export function Chat({ config }: { config: PublicDemoConfig }) {
  const [modelID, setModelID] = useState(DEFAULT_MODEL_ID);
  const modelRef = useRef(modelID);
  modelRef.current = modelID;
  const keysState = useFiducyKeys(FIDUCY_BASE_PATH);
  const { keys, refresh } = keysState;

  // The selected model rides along with every request; the server picks the user's key for it.
  const transport = useMemo(
    () =>
      new AssistantChatTransport({ api: CHAT_API_PATH, body: () => ({ model: modelRef.current }) }),
    []
  );
  const runtime = useChatRuntime({
    transport,
    // After the user saves a key in the thread, send the conversation again so the model answers.
    sendAutomaticallyWhen: lastAssistantMessageIsCompleteWithToolCalls
  });
  const auiConfig = useMemo(
    () =>
      AuiConfig({
        tools: Tools({
          toolkit: fiducyToolkit({
            gatewayURL: config.gatewayURL,
            appID: config.appID,
            basePath: FIDUCY_BASE_PATH,
            onConnected: () => void refresh()
          })
        })
      }),
    [config, refresh]
  );

  const selected = DEMO_MODELS.find((model) => model.id === modelID) ?? DEMO_MODELS[0];
  const hasKey = keys.some((key) => key.provider === selected?.provider);
  const providerLabel = selected ? PROVIDER_LABELS[selected.provider] : '';

  return (
    <AssistantRuntimeProvider runtime={runtime} config={auiConfig}>
      <div className="app">
        <aside className="sidebar">
          <div className="brand">
            <span className="brand-name">Acme Chat</span>
            <span className="muted">Example app</span>
          </div>
          <ThreadListPrimitive.Root className="thread-list">
            <ThreadListPrimitive.New className="new-chat">New chat</ThreadListPrimitive.New>
            <ThreadListPrimitive.Items components={{ ThreadListItem }} />
          </ThreadListPrimitive.Root>
          <KeysPanel {...keysState} />
          <p className="powered">
            Keys sealed by <a href="https://github.com/Benonii/fiducy">Fiducy</a>
          </p>
        </aside>

        <ThreadPrimitive.Root className="thread">
          <ThreadPrimitive.Viewport className="viewport">
            <ThreadPrimitive.Empty>
              <div className="welcome">
                <h1>What can I help with?</h1>
                <p className="muted">
                  Pick any model. If you have no key for it yet, the chat asks for one right here.
                  Acme never sees it.
                </p>
                <div className="suggestions">
                  {SUGGESTIONS.map((prompt) => (
                    <ThreadPrimitive.Suggestion
                      key={prompt}
                      prompt={prompt}
                      send
                      className="suggestion"
                    >
                      {prompt}
                    </ThreadPrimitive.Suggestion>
                  ))}
                </div>
              </div>
            </ThreadPrimitive.Empty>
            <ThreadPrimitive.Messages>
              {({ message }) => (
                <MessagePrimitive.Root
                  className={`message ${message.role}`}
                  data-role={message.role}
                >
                  <div className="message-body">
                    <MessagePrimitive.Parts />
                  </div>
                  <MessagePrimitive.Error>
                    <ErrorPrimitive.Root className="error-text">
                      <ErrorPrimitive.Message />
                    </ErrorPrimitive.Root>
                  </MessagePrimitive.Error>
                </MessagePrimitive.Root>
              )}
            </ThreadPrimitive.Messages>
          </ThreadPrimitive.Viewport>

          <ComposerPrimitive.Root className="composer">
            <ComposerPrimitive.Input
              className="composer-input"
              placeholder="Message Acme Chat"
              aria-label="Message"
              rows={1}
            />
            <div className="composer-bar">
              <label className="model-picker">
                <span className="visually-hidden">Model</span>
                <select value={modelID} onChange={(event) => setModelID(event.target.value)}>
                  {DEMO_MODELS.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.label}
                    </option>
                  ))}
                </select>
              </label>
              <span className={`key-status${hasKey ? ' is-connected' : ''}`}>
                {hasKey ? `Your ${providerLabel} key` : `No ${providerLabel} key yet`}
              </span>
              <ComposerPrimitive.Send className="send">Send</ComposerPrimitive.Send>
            </div>
          </ComposerPrimitive.Root>
        </ThreadPrimitive.Root>
      </div>
    </AssistantRuntimeProvider>
  );
}
