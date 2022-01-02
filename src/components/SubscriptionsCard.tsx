import Machinat from '@machinat/core';
import getVtuber from '../utils/getVtuber';
import { ACTION, WEBVIEW_PATH } from '../constant';
import ButtonsCard, { ButtonData } from './ButtonsCard';

type SubscriptionsCardProps = {
  subscriptions: string[];
  withOkButton?: boolean;
};

const SubscriptionsCard = ({
  subscriptions,
  withOkButton,
}: SubscriptionsCardProps) => {
  const buttons: ButtonData[] = [
    { type: 'webview', path: WEBVIEW_PATH.SUBSCRIPTIONS, text: 'Subscribe 📺' },
  ];
  if (withOkButton) {
    buttons.push({ type: 'action', action: ACTION.OK, text: 'Ok 👌' });
  }

  if (subscriptions.length === 0) {
    return (
      <ButtonsCard
        makeLineAltText={(template) => `${template.text}`}
        buttons={buttons}
      >
        You haven't subscribed to any VTuber. Subscribe here 👇
      </ButtonsCard>
    );
  }

  return (
    <ButtonsCard makeLineAltText={() => 'Subscribe VTubers'} buttons={buttons}>
      🔔 Subscriptions:
      <br />
      <br />
      {subscriptions.map((id) => {
        const vtuber = getVtuber(id);
        return `${vtuber.englishName} ${vtuber.oshiIcon}\n`;
      })}
    </ButtonsCard>
  );
};

export default SubscriptionsCard;
