import React from "react";
import { LSPluginUserEvents } from "@logseq/libs/dist/LSPlugin.user";

let _visible = logseq.isMainUIVisible;

export function subscribeLogseqEvent<T extends LSPluginUserEvents>(
  eventName: T,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  handler: (...args: any) => void
) {
  logseq.on(eventName, handler);
  return () => {
    logseq.off(eventName, handler);
  };
}

const subscribeToUIVisible = (onChange: () => void) =>
  subscribeLogseqEvent("ui:visible:changed", ({ visible }) => {
    _visible = visible;
    onChange();
  });

export const useAppVisible = () => {
  return React.useSyncExternalStore(subscribeToUIVisible, () => _visible);
};
