import Machinat, { MachinatNode } from '@machinat/core';
import * as Messenger from '@machinat/messenger/components';
import * as Telegram from '@machinat/telegram/components';
import * as Line from '@machinat/line/components';
import encodePostbackData from '../utils/encodePostbackData';
import { AppActionType } from '../types';

type ActionButtonData = {
  text: string;
  type: AppActionType;
};

type ActionsCardProps = {
  children: MachinatNode;
  actions: ActionButtonData[];
};

const encodeActionType = (type) => encodePostbackData({ action: type });

/**
 * This component use ReplyKeyboard in Telegram. If you don't need it, use the
 * ButtonsCard component.
 */
const ActionsCard = ({ children, actions }: ActionsCardProps, { platform }) => {
  switch (platform) {
    case 'messenger':
      return (
        <Messenger.ButtonTemplate
          buttons={actions.map((action) => (
            <Messenger.PostbackButton
              title={action.text}
              payload={encodeActionType(action.type)}
            />
          ))}
        >
          {children}
        </Messenger.ButtonTemplate>
      );

    case 'telegram':
      return (
        <Telegram.Text
          replyMarkup={
            <Telegram.ReplyKeyboard resizeKeyboard>
              <Telegram.KeyboardRow>
                {actions.map((action) => (
                  <Telegram.TextReply text={action.text} />
                ))}
              </Telegram.KeyboardRow>
            </Telegram.ReplyKeyboard>
          }
        >
          {children}
        </Telegram.Text>
      );

    case 'line':
      return (
        <Line.ButtonTemplate
          altText={(template) => template.text}
          actions={actions.map((action) => (
            <Line.PostbackAction
              label={action.text}
              data={encodeActionType(action.type)}
            />
          ))}
        >
          {children}
        </Line.ButtonTemplate>
      );

    default:
      return <>{children}</>;
  }
};

export default ActionsCard;
