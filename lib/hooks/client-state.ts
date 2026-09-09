"use client";
import { useSyncExternalStore } from 'react';
const noopSubscribe = () => () => {};
export function useMounted() {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
const subscribeClock = (notify: () => void) => {
  const timer = setInterval(notify, 30_000);
  return () => clearInterval(timer);
};
const localDateTime = () => {
  const date = new Date();
  return new Date(date.getTime() - date.getTimezoneOffset() * 60_000).toISOString().slice(0,16);
};
export function useLocalDateTime() {
  return useSyncExternalStore(subscribeClock, localDateTime, () => '');
}
