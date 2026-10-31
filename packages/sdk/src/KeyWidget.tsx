import { mountKeyWidget } from '@fiducy/widget';
import { useEffect, useRef } from 'react';

import type { KeyWidgetProps } from './types';

export function KeyWidget({ gatewayURL, appID, onHandle, onError, className }: KeyWidgetProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const onHandleRef = useRef(onHandle);
  const onErrorRef = useRef(onError);
  onHandleRef.current = onHandle;
  onErrorRef.current = onError;

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const widget = mountKeyWidget({
      gatewayURL,
      appID,
      container,
      onHandle: (handle) => onHandleRef.current(handle),
      onError: (message) => onErrorRef.current?.(message)
    });
    return widget.unmount;
  }, [gatewayURL, appID]);

  return <div ref={containerRef} className={className} />;
}
