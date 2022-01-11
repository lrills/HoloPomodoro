import type { MachinatProfile } from '@machinat/core';
import type {
  MessengerChat,
  MessengerUser,
  MessengerEventContext,
} from '@machinat/messenger';
import type {
  TelegramChat,
  TelegramUser,
  TelegramEventContext,
} from '@machinat/telegram';
import type { LineChat, LineUser, LineEventContext } from '@machinat/line';
import type MessengerAuthenticator from '@machinat/messenger/webview';
import type LineAuthenticator from '@machinat/line/webview';
import type TelegramAuthenticator from '@machinat/telegram/webview';
import type { WebviewEventContext } from '@machinat/webview';
import type { ACTION, WEBVIEW_PATH } from './constant';

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

export type WebviewPath = typeof WEBVIEW_PATH[keyof typeof WEBVIEW_PATH];

export type AppChannel = MessengerChat | TelegramChat | LineChat;
export type AppUser = MessengerUser | TelegramUser | LineUser;

export type ChatEventContext =
  | MessengerEventContext
  | TelegramEventContext
  | LineEventContext;

export type TimeUpEvent = {
  platform: 'messenger' | 'telegram' | 'line';
  category: 'app';
  type: 'time_up';
  payload: null;
  user: null;
  channel: AppChannel;
};

export type SettingsUpdatedEvent = {
  platform: 'messenger' | 'telegram' | 'line';
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
      platform: 'messenger' | 'telegram' | 'line';
      event: TimeUpEvent | SettingsUpdatedEvent;
    }
) & { intent: AppEventIntent };

export type AppScriptYield = {
  updateSettings?: Partial<AppSettings>;
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
  type: 'update_subscriptions';
  payload: { subscriptions: string[] };
};

export type FetchDataAction = {
  category: 'app';
  type: 'fetch_data';
  payload: { timezone: number };
};

export type WebviewAction =
  | UpdateSettingsAction
  | FetchDataAction
  | UpdateOshiAction
  | UpdateSubscriptionsAction;

export type WebEventContext<Action extends WebviewAction = WebviewAction> =
  WebviewEventContext<
    MessengerAuthenticator | TelegramAuthenticator | LineAuthenticator,
    Action
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
