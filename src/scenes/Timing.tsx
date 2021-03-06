import Machinat from '@machinat/core';
import { build } from '@machinat/script';
import * as $ from '@machinat/script/keywords';
import ReplyTiming from '../components/ReplyTiming';
import StopingCard from '../components/StopingCard';
import ReplyActions from '../components/ReplyActions';
import EndTiming from '../components/EndTiming';
import PomodoroIcon from '../components/PomodoroIcon';
import { ACTION, TimingPhase } from '../constant';
import type {
  AppEventContext,
  AppActionType,
  AppSettings,
  AppChannel,
} from '../types';
import ResetPomodoro from './ResetPomodoro';

type TimingParams = {
  time: number;
  settings: AppSettings;
  pomodoroNum: number;
  phase: TimingPhase;
};

type TimingVars = TimingParams & {
  beginAt: Date;
  action: AppActionType;
  isBeginning: boolean;
  isReseted: boolean;
};

type TimingReturn = {
  settings: AppSettings;
  pomodoroRecord: [Date, Date] | null;
  remainingTime: number;
  isReseted: boolean;
};

const PROMPT_WHEN_TIMING = (key: string) => (
  <$.PROMPT<TimingVars, AppEventContext>
    key={key}
    set={async ({ vars }, { event, intent }) => ({
      ...vars,
      action: intent.type,
      settings:
        event.type === 'settings_updated'
          ? event.payload.settings
          : vars.settings,
    })}
  />
);

export default build<TimingVars, AppEventContext, TimingParams, TimingReturn>(
  {
    name: 'Timing',
    initVars: (params) => ({
      ...params,
      beginAt: new Date(),
      action: ACTION.UNKNOWN,
      isBeginning: true,
      isReseted: false,
    }),
  },
  <$.BLOCK<TimingVars>>
    <$.WHILE<TimingVars>
      condition={({ vars: { action, time, beginAt } }) =>
        action !== ACTION.TIME_UP &&
        action !== ACTION.PAUSE &&
        action !== ACTION.SKIP &&
        time > Date.now() - beginAt.getTime()
      }
    >
      {({ channel, vars }) => (
        <ReplyActions
          phase={vars.phase}
          isTiming={true}
          channel={channel as AppChannel}
          action={vars.action}
          settings={vars.settings}
          defaultReply={
            <ReplyTiming
              isBeginning={vars.isBeginning}
              phase={vars.phase}
              settings={vars.settings}
              channel={channel as AppChannel}
              timingPhase={vars.phase}
              pomodoroNum={vars.pomodoroNum}
              remainingTime={vars.time - (Date.now() - vars.beginAt.getTime())}
            />
          }
        />
      )}
      <$.EFFECT<TimingVars>
        set={({ vars }) => ({ ...vars, isBeginning: false })}
      />

      {PROMPT_WHEN_TIMING('wait-timing-up')}

      {/* double check for skipping working phase */}
      <$.IF<TimingVars>
        condition={({ vars }) =>
          vars.action === ACTION.SKIP && vars.phase === TimingPhase.Working
        }
      >
        <$.THEN>
          {() => (
            <StopingCard>
              Skip current <PomodoroIcon />?
            </StopingCard>
          )}
          {PROMPT_WHEN_TIMING('ask-should-skip')}

          <$.EFFECT<TimingVars>
            set={({ vars }) => ({
              ...vars,
              action: vars.action === ACTION.OK ? ACTION.SKIP : vars.action,
            })}
          />
        </$.THEN>
        <$.ELSE_IF<TimingVars>
          condition={({ vars }) => vars.action === ACTION.RESET}
        >
          <$.CALL<TimingVars, typeof ResetPomodoro>
            script={ResetPomodoro}
            params={({ vars: { settings } }) => ({ settings })}
            key="ask-reset"
            set={({ vars }, { isConfirmed, settings, action }) => ({
              ...vars,
              isReseted: isConfirmed,
              settings,
              action,
            })}
          />

          <$.IF<TimingVars> condition={({ vars }) => vars.isReseted}>
            <$.THEN>
              <$.RETURN<TimingVars, TimingReturn>
                value={({ vars: { settings } }) => ({
                  settings,
                  isReseted: true,
                  pomodoroRecord: null,
                  remainingTime: 0,
                })}
              />
            </$.THEN>
          </$.IF>
        </$.ELSE_IF>
      </$.IF>
    </$.WHILE>

    {({ vars: { action, phase, pomodoroNum, settings } }) => {
      return (
        <EndTiming
          action={action}
          phase={phase}
          pomodoroNum={pomodoroNum}
          settings={settings}
        />
      );
    }}

    <$.RETURN<TimingVars, TimingReturn>
      value={({ vars: { beginAt, time, settings, phase, action } }) => ({
        settings,
        isReseted: false,
        pomodoroRecord:
          phase === TimingPhase.Working && action !== ACTION.PAUSE
            ? [beginAt, new Date()]
            : null,
        remainingTime:
          action === ACTION.PAUSE
            ? Math.max(0, time - (Date.now() - beginAt.getTime()))
            : 0,
      })}
    />
  </$.BLOCK>
);
