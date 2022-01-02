import Machinat from '@machinat/core';
import { build } from '@machinat/script';
import * as $ from '@machinat/script/keywords';
import ReplyActions from '../components/ReplyActions';
import StartingCard from '../components/StartingCard';
import currentDayId from '../utils/currentDayId';
import { ACTION, TimingPhase } from '../constant';
import type {
  AppSettings,
  AppEventContext,
  AppActionType,
  AppChannel,
} from '../types';

type StartingParams = {
  settings: AppSettings;
  phase: TimingPhase;
  remainingTime?: number;
  pomodoroNum: number;
  dayId: string;
};

type StartingVars = StartingParams & {
  action: AppActionType;
  isDayChanged: boolean;
};

type StartingReturn = {
  settings: AppSettings;
  isDayChanged: boolean;
};

const CHECK_DAY_CHANGE = () => (
  <$.EFFECT<StartingVars>
    set={({ vars }) => {
      const dayId = currentDayId(vars.settings.timezone);
      const isDayChanged = dayId !== vars.dayId;
      if (!isDayChanged) {
        return vars;
      }
      return {
        ...vars,
        dayId,
        isDayChanged: true,
        pomodoroNum: 1,
        phase: TimingPhase.Working,
        remainingTime: undefined,
      };
    }}
  />
);

export default build<
  StartingVars,
  AppEventContext,
  StartingParams,
  StartingReturn
>(
  {
    name: 'Starting',
    initVars: (params) => ({
      ...params,
      action: ACTION.OK,
      isDayChanged: false,
    }),
  },
  <>
    <$.WHILE<StartingVars>
      condition={({ vars: { action } }) => action !== ACTION.START}
    >
      {CHECK_DAY_CHANGE()}
      {({
        channel,
        vars: { action, settings, pomodoroNum, phase, remainingTime },
      }) => {
        if (action === ACTION.PAUSE) {
          return <p>It's not timing now 😉</p>;
        }
        if (action === ACTION.NO) {
          return <p>OK, tell me when yor're ready</p>;
        }
        return (
          <ReplyActions
            phase={phase}
            isTiming={false}
            channel={channel as AppChannel}
            action={action}
            settings={settings}
            defaultReply={
              <StartingCard
                oshi={settings.oshi}
                settings={settings}
                pomodoroNum={pomodoroNum}
                timingPhase={phase}
                remainingTime={remainingTime}
              />
            }
          />
        );
      }}

      <$.PROMPT<StartingVars, AppEventContext>
        key="wait-start"
        set={async ({ vars }, { event, intent }) => {
          return {
            ...vars,
            settings:
              event.type === 'settings_updated'
                ? event.payload.settings
                : vars.settings,
            action:
              vars.action === ACTION.OK && intent.type === ACTION.OK
                ? ACTION.START
                : intent.type,
          };
        }}
      />

      {CHECK_DAY_CHANGE()}
    </$.WHILE>

    <$.RETURN<StartingVars, StartingReturn>
      value={({ vars: { settings, isDayChanged } }) => ({
        settings,
        isDayChanged,
      })}
    />
  </>
);
