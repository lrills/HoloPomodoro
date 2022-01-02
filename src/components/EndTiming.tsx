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
          ? 'paused'
          : action === ACTION.SKIP
          ? 'skipped'
          : 'is up'}{' '}
        {getVtuber(settings.oshi)?.lang.postfix}
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
        ? 'paused'
        : action === ACTION.SKIP
        ? 'skipped'
        : 'finished'}{' '}
      {getVtuber(settings.oshi)?.lang.postfix}
    </p>
  );
};

export default EndTiming;
