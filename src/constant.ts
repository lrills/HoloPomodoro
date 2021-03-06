import { makeInterface } from '@machinat/core';
import { VtuberData } from './types';

export const OshiVtuberI = makeInterface<null | VtuberData>({
  name: 'OshiVtuber',
});

export const STATE_KEY = {
  APP_DATA: 'app_data' as const,
  PROFILE: 'profile' as const,
};

export const ACTION = {
  OK: 'ok' as const,
  NO: 'no' as const,
  START: 'start' as const,
  PAUSE: 'pause' as const,
  SKIP: 'skip' as const,
  CHECK_SETTINGS: 'settings' as const,
  CHECK_SUBSCRIPTIONS: 'subscriptions' as const,
  CHECK_STATISTICS: 'statistics' as const,
  GET_CLIP: 'clip' as const,
  ABOUT: 'about' as const,
  RESET: 'reset' as const,
  TIME_UP: 'time_up' as const,
  SETTINGS_UPDATED: 'settings_updated' as const,
  OSHI_UPDATED: 'oshi_updated' as const,
  SUBSCRIPTIONS_UPDATED: 'subscriptions_updated' as const,
  MESSENGER_GETTING_START: 'messenger_getting_start' as const,
  UNKNOWN: 'unknown' as const,
};

export enum TimingPhase {
  Working,
  ShortBreak,
  LongBreak,
}

export const WEBVIEW_PAGE = {
  STATISTICS: 'statistics' as const,
  SETTINGS: 'settings' as const,
  OSHI: 'oshi' as const,
  SUBSCRIPTIONS: 'subscriptions' as const,
};
