import Machinat from '@machinat/core';
import ordinal from 'ordinal';
import formatTime from '../utils/formatTime';
import { ACTION, TimingPhase } from '../constant';
import { AppSettings } from '../types';
import ActionsCard from './ActionsCard';
import PomodoroIcon from './PomodoroIcon';

type StartingCardProps = {
  oshi: null | string;
  remainingTime: undefined | number;
  pomodoroNum: number;
  timingPhase: TimingPhase;
  settings: AppSettings;
};

const StartingCard = ({
  oshi,
  remainingTime,
  pomodoroNum,
  timingPhase,
  settings,
}: StartingCardProps) => {
  const pomodoroIcon = <PomodoroIcon oshi={oshi} />;

  const msg = remainingTime ? (
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
      Start {pomodoroNum <= settings.pomodoroPerDay ? 'your' : 'further'}{' '}
      {pomodoroNum === settings.pomodoroPerDay ? 'last' : ordinal(pomodoroNum)}{' '}
      {pomodoroIcon}
    </>
  );

  return (
    <ActionsCard
      actions={[{ text: 'Start ▶️ ', type: ACTION.START }]}
      makeLineAltText={(template) =>
        `${template.text}\n\nTell me to "Start" when you ar ready`
      }
    >
      {msg}
    </ActionsCard>
  );
};

export default StartingCard;
