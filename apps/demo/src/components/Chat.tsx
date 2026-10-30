import {
  AssistantRuntimeProvider,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive
} from '@assistant-ui/react';
import { AssistantChatTransport, useChatRuntime } from '@assistant-ui/react-ai-sdk';
import { useMemo } from 'react';

import { CHAT_API_PATH } from '@/lib/constants';

interface ChatProps {
  handle: string;
  onForgetKey: () => void;
}

export function Chat({ handle, onForgetKey }: ChatProps) {
  const transport = useMemo(
    () => new AssistantChatTransport({ api: CHAT_API_PATH, body: { handle } }),
    [handle]
  );
  const runtime = useChatRuntime({ transport });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <section className="card chat">
        <ThreadPrimitive.Root className="thread">
          <ThreadPrimitive.Viewport className="viewport">
            <ThreadPrimitive.Empty>
              <p className="hint">Your key is connected. Ask anything.</p>
            </ThreadPrimitive.Empty>
            <ThreadPrimitive.Messages>
              {({ message }) => (
                <MessagePrimitive.Root
                  className={`message ${message.role}`}
                  data-role={message.role}
                >
                  <span className="speaker">{message.role === 'user' ? 'You' : 'Assistant'}</span>
                  <div className="message-body">
                    <MessagePrimitive.Parts />
                  </div>
                  <MessagePrimitive.Error>
                    <ErrorPrimitive.Root className="notice error">
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
              placeholder="Write a message"
              aria-label="Message"
              rows={1}
            />
            <ComposerPrimitive.Send>Send</ComposerPrimitive.Send>
          </ComposerPrimitive.Root>
        </ThreadPrimitive.Root>
      </section>
      <button type="button" className="secondary" onClick={onForgetKey}>
        Use a different key
      </button>
    </AssistantRuntimeProvider>
  );
}
