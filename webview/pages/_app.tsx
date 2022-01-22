import React from 'react';
import App from 'next/app';
import getConfig from 'next/config';
import WebviewClient, { useEventReducer } from '@machinat/webview/client';
import MessengerClientAuthenticator from '@machinat/messenger/webview/client';
import TelegramClientAuthenticator from '@machinat/telegram/webview/client';
import LineClientAuthenticator from '@machinat/line/webview/client';
import { WebClient, WebAppData, SendWebActionFn } from '../types';

const { publicRuntimeConfig } = getConfig();

const client: WebClient = new WebviewClient({
  mockupMode: typeof window === 'undefined',
  authenticators: [
    new MessengerClientAuthenticator({
      appId: publicRuntimeConfig.messengerAppId,
    }),
    new TelegramClientAuthenticator({
      botName: publicRuntimeConfig.telegramBotName,
    }),
    new LineClientAuthenticator({
      liffId: publicRuntimeConfig.lineLiffId,
    }),
  ],
});

client.onError(console.error);

const sendAction: SendWebActionFn = (action) => {
  client.send({ category: 'app', ...action });
};

const closeWebview = () => client.closeWebview();

const PomodoroApp = ({ Component, pageProps }) => {
  React.useEffect(() => {
    client.send({
      category: 'app',
      type: 'fetch_data',
      payload: { timezone: -(new Date().getTimezoneOffset() / 60) },
    });
  }, []);

  const appData = useEventReducer<WebAppData | null, WebClient>(
    client,
    (currentData, { event }) => {
      if (event.type === 'app_data') {
        return event.payload;
      }
      if (currentData && event.type === 'settings_updated') {
        return { ...currentData, settings: event.payload.settings };
      }
      return currentData;
    },
    null
  );

  return (
    <Component
      appData={appData}
      sendAction={sendAction}
      closeWebview={closeWebview}
      {...pageProps}
    />
  );
};

PomodoroApp.getInitialProps = async (appContext) => {
  const appProps = await App.getInitialProps(appContext);
  return { ...appProps };
};

export default PomodoroApp;
