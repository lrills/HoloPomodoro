import Machinat from '@machinat/core';
import { build } from '@machinat/script';
import * as $ from '@machinat/script/keywords';
import currentDayId from '../utils/currentDayId';
import { TimingPhase } from '../constant';
import type { AppSettings, AppEventContext, AppScriptYield } from '../types';
import Starting from './Starting';
import Timing from './Timing';
import Beginning from './Beginning';

type PomodoroParams = {
  settings: AppSettings;
};

type PomodoroVars = PomodoroParams & {
  pomodoroNum: number;
  phase: TimingPhase;
  dayId: string;
  remainingTime: undefined | number;
  registerTimerAt: Date;
  shouldSaveTz: boolean;
  pomodoroRecord: null | [Date, Date];
};

export default build<
  PomodoroVars,
  AppEventContext,
  PomodoroParams,
  void,
  AppScriptYield
>(
  {
    name: 'Pomodoro',
    initVars: ({ settings }) => ({
      settings,
      pomodoroNum: 1,
      remainingTime: undefined,
      phase: TimingPhase.Working,
      registerTimerAt: new Date(0),
      dayId: currentDayId(0),
      shouldSaveTz: false,
      pomodoroRecord: null,
    }),
  },
  <$.BLOCK<PomodoroVars>>
    <$.CALL<PomodoroVars, typeof Beginning>
      key={'beginning'}
      script={Beginning}
      params={({ vars: { settings } }) => ({ settings })}
      set={({ vars }, { settings }) => ({ ...vars, settings })}
    />

    {/* app event loop */}
    <$.WHILE<PomodoroVars> condition={() => true}>
      <$.CALL<PomodoroVars, typeof Starting>
        script={Starting}
        key="wait-starting"
        params={({ vars }) => ({ ...vars })}
        set={({ vars }, { settings, isDayChanged }) => {
          if (isDayChanged) {
            return {
              ...vars,
              settings,
              dayId: currentDayId(settings.timezone),
              pomodoroNum: 1,
              phase: TimingPhase.Working,
              remainingTime: undefined,
              registerTimerAt: new Date(
                Date.now() + settings.workingMins * 60000
              ),
            };
          }

          return {
            ...vars,
            settings,
            registerTimerAt: new Date(
              Date.now() +
                (vars.phase === TimingPhase.Working
                  ? settings.workingMins
                  : vars.phase === TimingPhase.LongBreak
                  ? settings.longBreakMins
                  : settings.shortBreakMins) *
                  60000
            ),
          };
        }}
      />

      <$.EFFECT<PomodoroVars, AppScriptYield>
        yield={({ vars }, prev) => ({
          ...prev,
          registerTimer: vars.registerTimerAt,
        })}
      />

      <$.CALL<PomodoroVars, typeof Timing>
        script={Timing}
        key="wait-timing"
        params={({ vars }) => {
          const { remainingTime, settings, phase } = vars;
          return {
            ...vars,
            time:
              remainingTime ||
              (phase === TimingPhase.Working
                ? settings.workingMins
                : phase === TimingPhase.LongBreak
                ? settings.longBreakMins
                : settings.shortBreakMins) * 60000,
          };
        }}
        set={({ vars }, { settings, remainingTime, pomodoroRecord }) => {
          const { pomodoroNum, phase } = vars;
          return {
            ...vars,
            settings,
            remainingTime,
            pomodoroRecord,
            pomodoroNum:
              remainingTime === 0 && phase === TimingPhase.Working
                ? pomodoroNum + 1
                : pomodoroNum,
            phase:
              remainingTime > 0
                ? phase
                : phase === TimingPhase.Working
                ? pomodoroNum % 4 === 0
                  ? TimingPhase.LongBreak
                  : TimingPhase.ShortBreak
                : TimingPhase.Working,
          };
        }}
      />

      <$.EFFECT<PomodoroVars, AppScriptYield>
        yield={({ vars }, prev) => ({
          ...prev,
          recordPomodoro: vars.pomodoroRecord || undefined,
          cancelTimer: vars.registerTimerAt,
        })}
      />
    </$.WHILE>
  </$.BLOCK>
);
