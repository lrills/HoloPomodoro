import Machinat from '@machinat/core';
import HTTP from '@machinat/http';
import Messenger from '@machinat/messenger';
import MessengerAuthenticator from '@machinat/messenger/webview';
import Line from '@machinat/line';
import LineAuthenticator from '@machinat/line/webview';
import Telegram from '@machinat/telegram';
import TelegramAuthenticator from '@machinat/telegram/webview';
import Webview from '@machinat/webview';
import RedisState from '@machinat/redis-state';
import { FileState } from '@machinat/local-state';
import DialogFlow from '@machinat/dialogflow';
import Script from '@machinat/script';
import * as scenesScirpts from './scenes';
import useClip from './services/useClip';
import useIntent from './services/useIntent';
import useAppData from './services/useAppData';
import useSettings from './services/useSettings';
import useUserProfile from './services/useUserProfile';
import ClipsManager, { ClipsManagerOptions } from './services/ClipsManager';
import Timer from './services/Timer';
import nextConfigs from '../webview/next.config.js';
import { ServerDomain, LineLiffId } from './constant';

const {
  // location
  PORT,
  DOMAIN,
  NODE_ENV,
  // clips
  CLIPS_AVAILABLE_HOURS,
  HOLODEX_API_KEY,
  // messenger
  MESSENGER_PAGE_ID,
  MESSENGER_ACCESS_TOKEN,
  MESSENGER_APP_SECRET,
  MESSENGER_VERIFY_TOKEN,
  // line
  LINE_PROVIDER_ID,
  LINE_CHANNEL_ID,
  LINE_ACCESS_TOKEN,
  LINE_CHANNEL_SECRET,
  LINE_LIFF_ID,
  // telegram
  TELEGRAM_BOT_TOKEN,
  TELEGRAM_SECRET_PATH,
  // dialogflow
  GOOGLE_APPLICATION_CREDENTIALS,
  DIALOG_FLOW_PROJECT_ID,
  DIALOG_FLOW_CLIENT_EMAIL,
  DIALOG_FLOW_PRIVATE_KEY,
  // webview
  WEBVIEW_AUTH_SECRET,
  // redis
  REDIS_URL,
} = process.env as Record<string, string>;

const DEV = NODE_ENV !== 'production';

const app = Machinat.createApp({
  modules: [
    HTTP.initModule({
      listenOptions: {
        port: PORT ? Number(PORT) : 8080,
      },
    }),

    DEV
      ? FileState.initModule({
          path: './.state_storage',
        })
      : RedisState.initModule({
          clientOptions: {
            url: REDIS_URL,
          },
        }),

    Script.initModule({
      libs: Object.values(scenesScirpts),
    }),

    DialogFlow.initModule({
      projectId: DIALOG_FLOW_PROJECT_ID,
      gcpAuthConfig: GOOGLE_APPLICATION_CREDENTIALS
        ? undefined
        : {
            credentials: {
              client_email: DIALOG_FLOW_CLIENT_EMAIL,
              private_key: DIALOG_FLOW_PRIVATE_KEY,
            },
          },
      defaultLanguageCode: 'en-US',
    }),
  ],

  platforms: [
    Messenger.initModule({
      webhookPath: '/webhook/messenger',
      pageId: Number(MESSENGER_PAGE_ID),
      appSecret: MESSENGER_APP_SECRET,
      accessToken: MESSENGER_ACCESS_TOKEN,
      verifyToken: MESSENGER_VERIFY_TOKEN,
      optionalProfileFields: ['timezone', 'locale'],
    }),

    Telegram.initModule({
      botToken: TELEGRAM_BOT_TOKEN,
      webhookPath: '/webhook/telegram',
      secretPath: TELEGRAM_SECRET_PATH,
    }),

    Line.initModule({
      webhookPath: '/webhook/line',
      providerId: LINE_PROVIDER_ID,
      channelId: LINE_CHANNEL_ID,
      accessToken: LINE_ACCESS_TOKEN,
      channelSecret: LINE_CHANNEL_SECRET,
      liffChannelIds: [LINE_LIFF_ID.split('-', 1)[0]],
    }),

    Webview.initModule<
      MessengerAuthenticator | TelegramAuthenticator | LineAuthenticator
    >({
      webviewHost: DOMAIN,
      webviewPath: '/webview',
      authSecret: WEBVIEW_AUTH_SECRET,

      sameSite: 'none',
      nextServerOptions: {
        dev: DEV,
        dir: './webview',
        conf: nextConfigs,
      },
    }),
  ],

  services: [
    // webview
    {
      provide: Webview.AuthenticatorList,
      withProvider: MessengerAuthenticator,
    },
    { provide: Webview.AuthenticatorList, withProvider: TelegramAuthenticator },
    { provide: Webview.AuthenticatorList, withProvider: LineAuthenticator },
    { provide: ServerDomain, withValue: DOMAIN },
    { provide: LineLiffId, withValue: LINE_LIFF_ID },
    // app
    useClip,
    useIntent,
    useAppData,
    useSettings,
    useUserProfile,
    Timer,
    ClipsManager,
    {
      provide: ClipsManagerOptions,
      withValue: {
        clipsAvailableHours: CLIPS_AVAILABLE_HOURS,
        holodexApiKey: HOLODEX_API_KEY,
        refreshLastestHours: 2,
      },
    },
  ],
});

export default app;
