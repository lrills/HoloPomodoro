import Machinat from '@machinat/core';
import { build } from '@machinat/script';
import * as $ from '@machinat/script/keywords';
import ReplyActions from '../components/ReplyActions';
import AskStarting from '../components/AskStarting';
import PomodoroIcon from '../components/PomodoroIcon';
import currentDayId from '../utils/currentDayId';
import { ACTION, TimingPhase } from '../constant';
import type {
  AppSettings,
  AppEventContext,
  AppActionType,
  AppChannel,
} from '../types';

type StartingParams = {
  isFirstTime: boolean;
  settings: AppSettings;
  phase: TimingPhase;
  remainingTime?: number;
  pomodoroNum: number;
  dayId: string;
};

type StartingVars = StartingParams & {
  action: AppActionType;
  isBeginning: boolean;
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
        action: vars.action === ACTION.START ? ACTION.OK : vars.action,
        isDayChanged: true,
        pomodoroNum: 1,
        phase: TimingPhase.Working,
        remainingTime: undefined,
        isBeginning: true,
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
      isBeginning: true,
      isDayChanged: false,
    }),
  },
  <>
    {CHECK_DAY_CHANGE()}

    <$.WHILE<StartingVars>
      condition={({ vars: { action } }) => action !== ACTION.START}
    >
      {({ platform, channel, vars }) => {
        if (vars.action === ACTION.PAUSE) {
          return <p>It's not timing now 😉</p>;
        }
        if (vars.action === ACTION.NO) {
          return <p>Ok, tell me when yor're ready</p>;
        }
        return (
          <ReplyActions
            phase={vars.phase}
            isTiming={false}
            channel={channel as AppChannel}
            action={vars.action}
            settings={vars.settings}
            defaultReply={
              <AskStarting
                withGreeting={
                  !vars.isFirstTime &&
                  vars.isBeginning &&
                  vars.pomodoroNum === 1 &&
                  vars.phase === TimingPhase.Working
                }
                settings={vars.settings}
                pomodoroNum={vars.pomodoroNum}
                timingPhase={vars.phase}
                remainingTime={vars.remainingTime}
              >
                {vars.isFirstTime &&
                  (platform === 'telegram' ? (
                    <>Press the "Start ▶️" button to get started 👇</>
                  ) : (
                    <>
                      Let's start your first{' '}
                      <PomodoroIcon oshi={vars.settings.oshi} />
                    </>
                  ))}
              </AskStarting>
            }
          />
        );
      }}
      <$.EFFECT<StartingVars>
        set={({ vars }) => ({ ...vars, isBeginning: false })}
      />

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
