import Machinat, { MachinatNode } from '@machinat/core';
import * as Messenger from '@machinat/messenger/components';
import { WebviewButton as MessengerWebviewButton } from '@machinat/messenger/webview';
import * as Telegram from '@machinat/telegram/components';
import { WebviewButton as TelegramWebviewButton } from '@machinat/telegram/webview';
import * as Line from '@machinat/line/components';
import { WebviewAction as LineWebviewAction } from '@machinat/line/webview';
import encodePostbackData from '../utils/encodePostbackData';
import { AppActionType, WebviewPage } from '../types';

type ActionButtonData = {
  type: 'action';
  text: string;
  action: AppActionType;
};

type WebviewButtonData = {
  type: 'webview';
  text: string;
  page: WebviewPage;
};

export type ButtonData = ActionButtonData | WebviewButtonData;

type ButtonsCardProps = {
  children: MachinatNode;
  buttons: ButtonData[];
};

const encodeActionType = (type) => encodePostbackData({ action: type });

const ButtonsCard = ({ children, buttons }: ButtonsCardProps, { platform }) => {
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
              <MessengerWebviewButton title={button.text} page={button.page} />
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
                  <TelegramWebviewButton
                    text={button.text}
                    page={button.page}
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
          altText={(template) => template.text}
          actions={buttons.map((button) =>
            button.type === 'action' ? (
              <Line.PostbackAction
                label={button.text}
                data={encodeActionType(button.action)}
              />
            ) : button.type === 'webview' ? (
              <LineWebviewAction label={button.text} page={button.page} />
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

export default ButtonsCard;
