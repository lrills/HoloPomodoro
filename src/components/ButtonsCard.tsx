import Machinat, { MachinatNode } from '@machinat/core';
import { makeContainer } from '@machinat/core/service';
import * as Messenger from '@machinat/messenger/components';
import * as Telegram from '@machinat/telegram/components';
import * as Line from '@machinat/line/components';
import encodePostbackData from '../utils/encodePostbackData';
import { ServerDomain, LineLiffId } from '../constant';
import { AppActionType, WebviewPath } from '../types';

type ActionButtonData = {
  type: 'action';
  text: string;
  action: AppActionType;
};

type WebviewButtonData = {
  type: 'webview';
  text: string;
  path: WebviewPath;
};

export type ButtonData = ActionButtonData | WebviewButtonData;

type ButtonsCardProps = {
  children: MachinatNode;
  buttons: ButtonData[];
  makeLineAltText: (template: Record<string, unknown>) => string;
};

const encodeActionType = (type) => encodePostbackData({ action: type });

const ButtonsCard =
  (domain: string, liffId: string) =>
  ({ children, buttons, makeLineAltText }: ButtonsCardProps, { platform }) => {
    switch (platform) {
      case 'messenger':
        return (
          <Messenger.ButtonTemplate
            buttons={buttons.map((button) =>
              button.type === 'action' ? (
                <Messenger.PostbackButton
                  title={button.text}
                  payload={encodeActionType(button.action)}
                />
              ) : button.type === 'webview' ? (
                <Messenger.UrlButton
                  title={button.text}
                  url={`https://${domain}/webview/${button.path}?platform=messenger`}
                  messengerExtensions
                />
              ) : null
            )}
          >
            {children}
          </Messenger.ButtonTemplate>
        );

      case 'telegram':
        return (
          <Telegram.Text
            replyMarkup={
              <Telegram.InlineKeyboard>
                {buttons.map((button) =>
                  button.type === 'action' ? (
                    <Telegram.CallbackButton
                      text={button.text}
                      data={encodeActionType(button.action)}
                    />
                  ) : button.type === 'webview' ? (
                    <Telegram.UrlButton
                      login
                      text={button.text}
                      url={`https://${domain}/auth/telegram?redirectUrl=${encodeURIComponent(
                        `/webview/${button.path}`
                      )}`}
                    />
                  ) : null
                )}
              </Telegram.InlineKeyboard>
            }
          >
            {children}
          </Telegram.Text>
        );

      case 'line':
        return (
          <Line.ButtonTemplate
            altText={makeLineAltText}
            actions={buttons.map((button) =>
              button.type === 'action' ? (
                <Line.PostbackAction
                  label={button.text}
                  data={encodeActionType(button.action)}
                />
              ) : button.type === 'webview' ? (
                <Line.UriAction
                  label={button.text}
                  uri={`https://liff.line.me/${liffId}/${button.path}`}
                />
              ) : null
            )}
          >
            {children}
          </Line.ButtonTemplate>
        );

      default:
        return <>{children}</>;
    }
  };

export default makeContainer({
  deps: [ServerDomain, LineLiffId],
})(ButtonsCard);
