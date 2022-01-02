import WebviewClient from '@machinat/webview/client';
import { MessengerClientAuthenticator } from '@machinat/messenger/webview';
import { TelegramClientAuthenticator } from '@machinat/telegram/webview';
import { LineClientAuthenticator } from '@machinat/line/webview';
import type {
  WebPushEvent,
  WebAppData,
  UpdateSettingsAction,
  UpdateOshiAction,
  UpdateSubscriptionsAction,
} from '../src/types';

export type {
  AppSettings,
  UpdateSettingsAction,
  WebAppData,
  VtuberData,
} from '../src/types';

export type WebClient = WebviewClient<
  | MessengerClientAuthenticator
  | TelegramClientAuthenticator
  | LineClientAuthenticator,
  WebPushEvent
>;

export type SendWebActionFn = (
  action: Omit<
    UpdateSettingsAction | UpdateOshiAction | UpdateSubscriptionsAction,
    'category'
  >
) => void;

export type PanelPageProps = {
  appData: WebAppData | null;
  sendAction: SendWebActionFn;
  closeWebview: () => boolean;
};
