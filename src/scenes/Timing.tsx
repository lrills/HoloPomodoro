import ordinal from 'ordinal';
import Machinat from '@machinat/core';
import { build } from '@machinat/script';
import {
  $,
  IF,
  THEN,
  WHILE,
  PROMPT,
  EFFECT,
  RETURN,
} from '@machinat/script/keywords';
import TimingCard from '../components/TimingCard';
import StopingCard from '../components/StopingCard';
import ReplyBasicActions from '../components/ReplyBasicActions';
import FinishTarget from '../components/FinishTarget';
import {
  ACTION_SKIP,
  ACTION_PAUSE,
  ACTION_TIME_UP,
  ACTION_OK,
  ACTION_UNKNOWN,
  TimingPhase,
} from '../constant';
import type {
  PomodoroEventContext,
  AppActionType,
  PomodoroSettings,
  AppChannel,
} from '../types';

type TimingParams = {
  time: number;
  pomodoroNum: number;
  settings: PomodoroSettings;
  phase: TimingPhase;
};

type TimingVars = TimingParams & {
  beginAt: Date;
  action: AppActionType;
};

type TimingReturn = {
  settings: PomodoroSettings;
  pomodoroRecord: [Date, Date] | null;
  remainingTime: number;
};

const PROMPT_WHEN_TIMING = (key: string) => (
  <PROMPT<TimingVars, PomodoroEventContext>
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

export default build<
  TimingVars,
  PomodoroEventContext,
  TimingParams,
  TimingReturn
>(
  {
    name: 'Timing',
    initVars: (params) => ({
      ...params,
      beginAt: new Date(),
      action: ACTION_UNKNOWN,
    }),
  },
  <$<TimingVars>>
    <WHILE<TimingVars>
      condition={({ vars: { action, time, beginAt } }) =>
        action !== ACTION_TIME_UP &&
        action !== ACTION_PAUSE &&
        action !== ACTION_SKIP &&
        time > Date.now() - beginAt.getTime()
      }
    >
      {({
        channel,
        vars: { settings, action, time, phase, pomodoroNum, beginAt },
      }) => {
        return (
          <ReplyBasicActions
            channel={channel as AppChannel}
            action={action}
            settings={settings}
            defaultReply={
              <TimingCard
                timingPhase={phase}
                pomodoroNum={pomodoroNum}
                remainingTime={time - (Date.now() - beginAt.getTime())}
              />
            }
          />
        );
      }}

      {PROMPT_WHEN_TIMING('wait-timing-up')}

      {/* double check for skipping working phase */}
      <IF<TimingVars>
        condition={({ vars }) =>
          vars.action === ACTION_SKIP && vars.phase === TimingPhase.Working
        }
      >
        <THEN>
          {() => <StopingCard>Skip current 🍅?</StopingCard>}
          {PROMPT_WHEN_TIMING('ask-should-skip')}

          <EFFECT<TimingVars>
            set={({ vars }) => ({
              ...vars,
              action: vars.action === ACTION_OK ? ACTION_SKIP : vars.action,
            })}
          />
        </THEN>
      </IF>
    </WHILE>

    {({ vars: { action, phase, pomodoroNum, settings } }) => {
      if (phase !== TimingPhase.Working) {
        return (
          <p>
            Break time{' '}
            {action === ACTION_PAUSE
              ? 'paused'
              : action === ACTION_SKIP
              ? 'skipped'
              : 'is up'}
          </p>
        );
      }

      if (pomodoroNum === settings.pomodoroPerDay) {
        return <FinishTarget pomodoroTarget={settings.pomodoroPerDay} />;
      }

      return (
        <p>
          {ordinal(pomodoroNum)} 🍅{' '}
          {action === ACTION_PAUSE
            ? 'paused'
            : action === ACTION_SKIP
            ? 'skipped'
            : 'finished'}
        </p>
      );
    }}

    <RETURN<TimingVars, TimingReturn>
      value={({ vars: { beginAt, time, settings, phase, action } }) => ({
        settings,
        pomodoroRecord:
          phase === TimingPhase.Working && action !== ACTION_PAUSE
            ? [beginAt, new Date()]
            : null,
        remainingTime:
          action === ACTION_PAUSE
            ? Math.max(0, time - (Date.now() - beginAt.getTime()))
            : 0,
      })}
    />
  </$>
);
