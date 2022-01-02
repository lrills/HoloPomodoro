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
import StatisticsCard from './StatisticsCard';
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
      if (action === ACTION.ABOUT) {
        return <About />;
      }
      if (action === ACTION.CHECK_SETTINGS) {
        return <SettingsCard withEditButton settings={settings} />;
      }
      if (action === ACTION.SETTINGS_UPDATED) {
        return (
          <>
            <p>Your settings is updated ⚙️</p>
            <SettingsCard noTitle withEditButton settings={settings} />
          </>
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
          const vtuber = getVtuber(settings.oshi);
          return <p>You should focus right now {vtuber?.lang.postfix}</p>;
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
              makeLineAltText={(template) => template.text as string}
              buttons={[
                {
                  type: 'webview',
                  path: WEBVIEW_PATH.SUBSCRIPTIONS,
                  text: 'Subscribe 📺',
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
