import Machinat from '@machinat/core';
import ordinal from 'ordinal';
import { TimingPhase, ACTION } from '../constant';
import { AppActionType, AppSettings } from '../types';
import FinishTarget from './FinishTarget';
import PomodoroIcon from './PomodoroIcon';
import PositiveEnd from './PositiveEnd';

type EndTimingProps = {
  phase: TimingPhase;
  action: AppActionType;
  settings: AppSettings;
  pomodoroNum: number;
};

const EndTiming = ({
  phase,
  action,
  settings,
  pomodoroNum,
}: EndTimingProps) => {
  if (phase !== TimingPhase.Working) {
    return (
      <p>
        Break time{' '}
        {action === ACTION.PAUSE
          ? 'is paused'
          : action === ACTION.SKIP
          ? 'is skipped'
          : 'is up'}{' '}
        <PositiveEnd />
      </p>
    );
  }

  if (pomodoroNum === settings.pomodoroPerDay) {
    return <FinishTarget oshi={settings.oshi} />;
  }

  return (
    <p>
      {ordinal(pomodoroNum)} <PomodoroIcon />{' '}
      {action === ACTION.PAUSE
        ? 'is paused'
        : action === ACTION.SKIP
        ? 'is skipped'
        : 'is finished'}{' '}
      <PositiveEnd />
    </p>
  );
};

export default EndTiming;
