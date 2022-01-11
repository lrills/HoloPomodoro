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
import ResetPomodoro from './ResetPomodoro';

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
  shouldGreet: boolean;
  isReseted: boolean;
};

type StartingReturn = {
  settings: AppSettings;
  isReseted: boolean;
};

const CHECK_DAY_CHANGE = () => (
  <$.EFFECT<StartingVars>
    set={({ vars }) => {
      const dayId = currentDayId(vars.settings.timezone);
      if (dayId === vars.dayId) {
        return vars;
      }

      return {
        ...vars,
        dayId,
        action: vars.action === ACTION.START ? ACTION.OK : vars.action,
        pomodoroNum: 1,
        phase: TimingPhase.Working,
        remainingTime: undefined,
        isBeginning: true,
        isReseted: true,
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
      shouldGreet:
        !params.isFirstTime &&
        params.pomodoroNum === 1 &&
        params.phase === TimingPhase.Working &&
        !params.remainingTime,
      isReseted: false,
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
                withGreeting={vars.shouldGreet}
                settings={vars.settings}
                pomodoroNum={vars.pomodoroNum}
                timingPhase={vars.phase}
                remainingTime={vars.remainingTime}
              >
                {vars.isFirstTime ? (
                  platform === 'telegram' ? (
                    <>Press the "Start ▶️" button to get started 👇</>
                  ) : (
                    <>
                      Let's start your first{' '}
                      <PomodoroIcon oshi={vars.settings.oshi} />
                    </>
                  )
                ) : null}
              </AskStarting>
            }
          />
        );
      }}
      <$.EFFECT<StartingVars>
        set={({ vars }) => ({ ...vars, shouldGreet: false })}
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

      <$.IF<StartingVars>
        condition={({ vars }) => vars.action === ACTION.RESET}
      >
        <$.THEN>
          <$.CALL<StartingVars, typeof ResetPomodoro>
            script={ResetPomodoro}
            key="ask-reset"
            params={({ vars: { settings } }) => ({ settings })}
            set={({ vars }, { settings, isConfirmed, action }) =>
              isConfirmed
                ? {
                    ...vars,
                    action,
                    settings,
                    isReseted: true,
                    pomodoroNum: 1,
                    remainingTime: 0,
                    phase: TimingPhase.Working,
                  }
                : { ...vars, action, settings }
            }
          />
        </$.THEN>
      </$.IF>

      {CHECK_DAY_CHANGE()}
    </$.WHILE>

    <$.RETURN<StartingVars, StartingReturn>
      value={({ vars: { settings, isReseted } }) => ({ settings, isReseted })}
    />
  </>
);
