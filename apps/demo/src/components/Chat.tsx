import {
  AssistantRuntimeProvider,
  ComposerPrimitive,
  ErrorPrimitive,
  MessagePrimitive,
  ThreadPrimitive
} from '@assistant-ui/react';
import { AssistantChatTransport, useChatRuntime } from '@assistant-ui/react-ai-sdk';
import { useMemo } from 'react';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
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
      <Card render={<section />} className="mb-4">
        <ThreadPrimitive.Root className="flex min-h-[420px] flex-col">
          <ThreadPrimitive.Viewport className="grid flex-1 content-start gap-4 overflow-y-auto p-5">
            <ThreadPrimitive.Empty>
              <p className="text-muted-foreground text-sm">Your key is connected. Ask anything.</p>
            </ThreadPrimitive.Empty>
            <ThreadPrimitive.Messages>
              {({ message }) => (
                <MessagePrimitive.Root className="group grid gap-1" data-role={message.role}>
                  <span className="font-mono text-muted-foreground text-xs uppercase tracking-wider">
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </span>
                  <div className="whitespace-pre-wrap group-data-[role=user]:justify-self-start group-data-[role=user]:border group-data-[role=user]:px-3 group-data-[role=user]:py-2">
                    <MessagePrimitive.Parts />
                  </div>
                  <MessagePrimitive.Error>
                    <ErrorPrimitive.Root className="border-destructive border-l-2 px-3 py-2 text-destructive text-sm">
                      <ErrorPrimitive.Message />
                    </ErrorPrimitive.Root>
                  </MessagePrimitive.Error>
                </MessagePrimitive.Root>
              )}
            </ThreadPrimitive.Messages>
          </ThreadPrimitive.Viewport>
          <ComposerPrimitive.Root className="flex gap-2 border-t p-3">
            <ComposerPrimitive.Input
              className="flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-muted-foreground"
              placeholder="Write a message"
              aria-label="Message"
              rows={1}
            />
            <ComposerPrimitive.Send asChild>
              <Button>Send</Button>
            </ComposerPrimitive.Send>
          </ComposerPrimitive.Root>
        </ThreadPrimitive.Root>
      </Card>
      <Button variant="outline" onClick={onForgetKey}>
        Use a different key
      </Button>
    </AssistantRuntimeProvider>
  );
}
