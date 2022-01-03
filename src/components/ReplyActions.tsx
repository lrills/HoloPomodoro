import Machinat, { MachinatNode } from '@machinat/core';
import { makeContainer } from '@machinat/core/service';
import useAppData from '../services/useAppData';
import useClip from '../services/useClip';
import getVtuber from '../utils/getVtuber';
import { ACTION, WEBVIEW_PATH, TimingPhase } from '../constant';
import type { AppActionType, AppSettings, AppChannel } from '../types';
import About from './About';
import ButtonsCard from './ButtonsCard';
import SettingsCard from './SettingsCard';
import SubscriptionsCard from './SubscriptionsCard';
import StatisticsCard from './StatisticsCard';
import VtuberDebut from './VtuberDebut';
import ClipCard from './ClipCard';

type ReplyActionsProps = {
  phase: TimingPhase;
  isTiming: boolean;
  channel: AppChannel;
  action: AppActionType;
  settings: AppSettings;
  defaultReply?: MachinatNode;
};

export default makeContainer({ deps: [useAppData, useClip] as const })(
  function ReplyActions(fetchAppData, fetchClip) {
    return async ({
      action,
      settings,
      phase,
      isTiming,
      channel,
      defaultReply = null,
    }: ReplyActionsProps) => {
      const vtuber = getVtuber(settings.oshi);
      if (action === ACTION.ABOUT) {
        return <About />;
      }
      if (
        action === ACTION.CHECK_SETTINGS ||
        action === ACTION.SETTINGS_UPDATED
      ) {
        return (
          <SettingsCard
            withEditButton
            isChanged={action === ACTION.SETTINGS_UPDATED}
            settings={settings}
          />
        );
      }
      if (
        action === ACTION.CHECK_SUBSCRIPTIONS ||
        action === ACTION.SUBSCRIPTIONS_UPDATED
      ) {
        return (
          <SubscriptionsCard
            isChanged={action === ACTION.SUBSCRIPTIONS_UPDATED}
            settings={settings}
          />
        );
      }
      if (action === ACTION.OSHI_UPDATED) {
        return vtuber ? (
          <VtuberDebut id={vtuber.id} withTwitterButton withYoutubeButton />
        ) : (
          <p>No favorite VTuber is selected. You can select one in the menu</p>
        );
      }
      if (action === ACTION.CHECK_STATISTICS) {
        const { settings, statistics } = await fetchAppData(channel);
        return (
          <StatisticsCard
            oshi={settings.oshi}
            settings={settings}
            statistics={statistics}
          />
        );
      }
      if (action === ACTION.GET_CLIP) {
        if (isTiming && phase === TimingPhase.Working) {
          return <p>You should focus right now {vtuber?.lang.positiveEnd}</p>;
        }

        const clip = await fetchClip(
          channel,
          !isTiming
            ? undefined
            : phase === TimingPhase.LongBreak
            ? settings.longBreakMins
            : settings.shortBreakMins
        );

        if (!clip) {
          return (
            <ButtonsCard
              buttons={[
                {
                  type: 'webview',
                  path: WEBVIEW_PATH.SUBSCRIPTIONS,
                  text: 'Subscribe 💑',
                },
              ]}
            >
              There is no available clip. You can subscribe more VTubers 👇
            </ButtonsCard>
          );
        }

        return <ClipCard clip={clip} withYoutubeButton withMoreButton />;
      }
      return <>{defaultReply}</>;
    };
  }
);
