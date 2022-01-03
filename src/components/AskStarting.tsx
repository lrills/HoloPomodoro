import Machinat, { MachinatNode } from '@machinat/core';
import ordinal from 'ordinal';
import formatTime from '../utils/formatTime';
import { ACTION, TimingPhase } from '../constant';
import getVtuber from '../utils/getVtuber';
import { AppSettings } from '../types';
import ActionsCard from './ActionsCard';
import PomodoroIcon from './PomodoroIcon';

type AskStartingProps = {
  children?: MachinatNode;
  withGreeting: boolean;
  remainingTime: undefined | number;
  pomodoroNum: number;
  timingPhase: TimingPhase;
  settings: AppSettings;
};

const AskStarting = ({
  children,
  remainingTime,
  pomodoroNum,
  timingPhase,
  settings,
  withGreeting,
}: AskStartingProps) => {
  const pomodoroIcon = <PomodoroIcon oshi={settings.oshi} />;

  const greeting = withGreeting
    ? `${getVtuber(settings.oshi)?.lang.hello}!`
    : undefined;

  return (
    <>
      {greeting && <p>{greeting}</p>}
      <ActionsCard actions={[{ text: 'Start ▶️', type: ACTION.START }]}>
        {children ||
          (remainingTime ? (
            <>
              Continue{' '}
              {timingPhase === TimingPhase.Working ? (
                <>
                  {ordinal(pomodoroNum)} {pomodoroIcon}
                </>
              ) : (
                <>break time ☕</>
              )}
              , {formatTime(remainingTime)} remain
            </>
          ) : timingPhase !== TimingPhase.Working ? (
            <>
              Take a{' '}
              {timingPhase === TimingPhase.LongBreak
                ? settings.longBreakMins
                : settings.shortBreakMins}{' '}
              min break ☕
            </>
          ) : (
            <>
              Start {pomodoroNum === 1 ? 'your ' : ' '}
              {pomodoroNum === settings.pomodoroPerDay
                ? 'last'
                : ordinal(pomodoroNum)}{' '}
              {pomodoroIcon} today
            </>
          ))}
      </ActionsCard>
    </>
  );
};

export default AskStarting;
