import React from 'react';
import App from 'next/app';
import getConfig from 'next/config';
import { useEventReducer, useClient } from '@machinat/webview/client';
import MessengerAuth from '@machinat/messenger/webview/client';
import TelegramAuth from '@machinat/telegram/webview/client';
import LineAuth from '@machinat/line/webview/client';
import { WebAppData, SendWebActionFn, WebviewAction } from '../types';

const {
  publicRuntimeConfig: { messengerPageId, telegramBotName, lineLiffId },
} = getConfig();

const PomodoroApp = ({ Component, pageProps }) => {
  const client = useClient<
    MessengerAuth | TelegramAuth | LineAuth,
    WebviewAction
  >({
    mockupMode: typeof window === 'undefined',
    authPlatforms: [
      new MessengerAuth({ pageId: messengerPageId }),
      new TelegramAuth({ botName: telegramBotName }),
      new LineAuth({ liffId: lineLiffId }),
    ],
  });

  const appData = useEventReducer<WebAppData | null>(
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

  React.useEffect(() => {
    client.send({
      category: 'app',
      type: 'update_tz',
      payload: { timezone: -(new Date().getTimezoneOffset() / 60) },
    });
  }, []);

  const sendAction: SendWebActionFn = (action) => {
    client.send({ category: 'app', ...action });
  };

  const closeWebview = () => client.closeWebview();

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
