import Machinat from '@machinat/core';
import getVtuber from '../utils/getVtuber';
import { AppSettings } from '../types';
import { ACTION, WEBVIEW_PATH } from '../constant';
import ActionsCard from './ActionsCard';
import ButtonsCard, { ButtonData } from './ButtonsCard';

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
  const { oshi, subscriptions } = settings;
  const buttons: ButtonData[] = [
    { type: 'webview', path: WEBVIEW_PATH.SUBSCRIPTIONS, text: 'Subscribe 💑' },
  ];
  if (subscriptions.length === 0) {
    return (
      <ButtonsCard buttons={buttons}>
        You haven't subscribed to any VTuber. Subscribe here 👇
      </ButtonsCard>
    );
  }

  const oshiVtuber = getVtuber(oshi);
  const ending = oshiVtuber?.lang.positiveEnd;
  const titleContent = title || (
    <>
      🔔 Subscriptions
      {!isChanged ? ':' : ending ? ` changed ${ending}` : ' changed:'}
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
