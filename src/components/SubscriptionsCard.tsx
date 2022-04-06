import Machinat from '@machinat/core';
import getVtuber from '../utils/getVtuber';
import { AppSettings } from '../types';
import { ACTION, WEBVIEW_PAGE } from '../constant';
import ButtonsCard, { ButtonData } from './ButtonsCard';
import ActionsCard from './ActionsCard';
import PositiveEnd from './PositiveEnd';

type SubscriptionsCardProps = {
  title?: string;
  isChanged?: boolean;
  settings: AppSettings;
  withOkButton?: boolean;
};

const SubscriptionsCard = (
  { title, isChanged, settings, withOkButton }: SubscriptionsCardProps,
  { platform }
) => {
  const { subscriptions } = settings;
  const buttons: ButtonData[] = [
    { type: 'webview', page: WEBVIEW_PAGE.SUBSCRIPTIONS, text: 'Subscribe 💑' },
  ];
  if (subscriptions.length === 0) {
    return (
      <ButtonsCard buttons={buttons}>
        You haven't subscribed to any VTuber. Subscribe here 👇
      </ButtonsCard>
    );
  }

  const titleContent = title || (
    <>
      🔔 Subscriptions
      {isChanged ? (
        <>
          {' '}
          changed <PositiveEnd />
        </>
      ) : (
        ':'
      )}
    </>
  );
  const titleMsg =
    platform === 'telegram' && withOkButton ? (
      <ActionsCard
        actions={[
          {
            type: ACTION.OK,
            text: 'Ok 👌',
          },
        ]}
      >
        {titleContent}
      </ActionsCard>
    ) : (
      <p>{titleContent}</p>
    );

  if (withOkButton) {
    buttons.push({ type: 'action', action: ACTION.OK, text: 'Ok 👌' });
  }

  return (
    <>
      {titleMsg}
      <ButtonsCard buttons={buttons}>
        {subscriptions.map((id) => {
          const vtuber = getVtuber(id);
          return `${vtuber.oshiIcon} ${vtuber.englishName}\n`;
        })}
      </ButtonsCard>
    </>
  );
};

export default SubscriptionsCard;
