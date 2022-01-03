import Machinat from '@machinat/core';
import ordinal from 'ordinal';
import { TimingPhase, ACTION } from '../constant';
import getVtuber from '../utils/getVtuber';
import { AppActionType, AppSettings } from '../types';
import FinishTarget from './FinishTarget';
import PomodoroIcon from './PomodoroIcon';

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
        {getVtuber(settings.oshi)?.lang.positiveEnd}
      </p>
    );
  }

  if (pomodoroNum === settings.pomodoroPerDay) {
    return <FinishTarget oshi={settings.oshi} />;
  }

  return (
    <p>
      {ordinal(pomodoroNum)} <PomodoroIcon oshi={settings.oshi} />{' '}
      {action === ACTION.PAUSE
        ? 'is paused'
        : action === ACTION.SKIP
        ? 'is skipped'
        : 'is finished'}{' '}
      {getVtuber(settings.oshi)?.lang.positiveEnd}
    </p>
  );
};

export default EndTiming;
