export interface MountKeyWidgetOptions {
  gatewayURL: string;
  appID: string;
  container: HTMLElement;
  onHandle: (handle: string) => void;
  onError?: (message: string) => void;
}

export interface MountedKeyWidget {
  iframe: HTMLIFrameElement;
  unmount: () => void;
}

export type WidgetMessage =
  | { type: 'fiducy:ready' }
  | { type: 'fiducy:handle'; handle: string }
  | { type: 'fiducy:error'; message: string };
