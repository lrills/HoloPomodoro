import type { MachinatProfile } from '@machinat/core';
import type { MessengerEventContext } from '@machinat/messenger';
import type { TwitterEventContext } from '@machinat/twitter';
import type { TelegramEventContext } from '@machinat/telegram';
import type { LineEventContext } from '@machinat/line';
import type MessengerAuth from '@machinat/messenger/webview';
import type TwitterAuth from '@machinat/twitter/webview';
import type TelegramAuth from '@machinat/telegram/webview';
import type LineAuth from '@machinat/line/webview';
import type {
  WebviewEventContext,
  ConnectEventValue,
  DisconnectEventValue,
} from '@machinat/webview';
import type { ACTION, WEBVIEW_PAGE } from './constant';

export type LanguageConfig = {
  selfCall: undefined | string;
  nickname: string;
  introduction: undefined | string;
  positiveEnd: undefined | string;
  hello: string;
  greeting: string;
  otsukare: undefined | string;
  fanName: string;
};

export type ColorConfig = {
  primary: string;
  secondary: string;
};

export type VtuberData = {
  id: string;
  name: string;
  englishName: string;
  org: string;
  group: undefined | string;
  photo: string;
  twitter: string;
  fanName: string;
  oshiIcon: string;
  pomodoroIcon: string;
  color: ColorConfig;
  lang: LanguageConfig;
};

export type AppSettings = {
  oshi: null | string;
  subscriptions: string[];
  workingMins: number;
  shortBreakMins: number;
  longBreakMins: number;
  pomodoroPerDay: number;
  timezone: number;
  clipLanguages: string[];
};

export type Statistics = {
  day: string;
  records: [Date, Date][];
  recentCounts: [string, number][];
};

export type AppData = {
  settings: AppSettings;
  statistics: Statistics;
  clipsHistory: string[];
};

export type AppActionType = typeof ACTION[keyof typeof ACTION];

export type WebviewPage = typeof WEBVIEW_PAGE[keyof typeof WEBVIEW_PAGE];

export type ChatEventContext =
  | MessengerEventContext
  | TwitterEventContext
  | TelegramEventContext
  | LineEventContext;

export type AppChannel = NonNullable<ChatEventContext['event']['channel']>;
export type AppUser = NonNullable<ChatEventContext['event']['user']>;
export type AppPlatform = NonNullable<ChatEventContext['platform']>;

export type TimeUpEvent = {
  platform: AppPlatform;
  category: 'app';
  type: 'time_up';
  payload: null;
  user: null;
  channel: AppChannel;
};

export type SettingsUpdatedEvent = {
  platform: AppPlatform;
  category: 'app';
  type: 'settings_updated';
  payload: { settings: AppSettings };
  user: AppUser;
  channel: AppChannel;
};

export type AppEventIntent = {
  type: AppActionType;
  confidence: number;
  payload: any;
};

export type AppEventContext = (
  | ChatEventContext
  | {
      platform: AppPlatform;
      event: TimeUpEvent | SettingsUpdatedEvent;
    }
) & { intent: AppEventIntent };

export type AppScriptYield = {
  registerTimer?: Date;
  cancelTimer?: Date;
  recordPomodoro?: [Date, Date];
  resetPomodoro?: boolean;
};

export type UpdateSettingsAction = {
  category: 'app';
  type: 'update_settings';
  payload: { settings: Partial<AppSettings> };
};

export type UpdateOshiAction = {
  category: 'app';
  type: 'update_oshi';
  payload: { oshi: null | string };
};

export type UpdateSubscriptionsAction = {
  category: 'app';
  type: 'update_subs';
  payload: { subscriptions: string[] };
};

export type UpdateTimezoneAction = {
  category: 'app';
  type: 'update_tz';
  payload: { timezone: number };
};

export type WebviewAction =
  | UpdateSettingsAction
  | UpdateOshiAction
  | UpdateTimezoneAction
  | UpdateSubscriptionsAction;

export type WebEventContext = WebviewEventContext<
  MessengerAuth | TwitterAuth | TelegramAuth | LineAuth,
  WebviewAction | ConnectEventValue | DisconnectEventValue
>;

export type WebAppData = AppData & {
  userProfile: null | MachinatProfile;
};

export type WebAppDataPush = {
  category: 'app';
  type: 'app_data';
  payload: WebAppData;
};

export type WebSettingsUpdatedPush = {
  category: 'app';
  type: 'settings_updated';
  payload: { settings: AppSettings };
};

export type WebPushEvent = WebAppDataPush | WebSettingsUpdatedPush;

export type ClipData = {
  id: string;
  title: string;
  availableAt: number;
  duration: number;
  channelId: string;
  lang: string;
  sources: string[];
  mentions: string[];
};
