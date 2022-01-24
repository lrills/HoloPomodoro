import WebviewClient from '@machinat/webview/client';
import MessengerWebviewAuth from '@machinat/messenger/webview/client';
import TelegramWebviewAuth from '@machinat/telegram/webview/client';
import LineWebviewAuth from '@machinat/line/webview/client';
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
  MessengerWebviewAuth | TelegramWebviewAuth | LineWebviewAuth,
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
