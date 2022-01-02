import Machinat, { MachinatNode } from '@machinat/core';
import ordinal from 'ordinal';
import formatTime from '../utils/formatTime';
import { ACTION, TimingPhase } from '../constant';
import ActionsCard from './ActionsCard';
import PomodoroIcon from './PomodoroIcon';

type TimingCardProps = {
  children?: MachinatNode;
  oshi: null | string;
  timingPhase: TimingPhase;
  pomodoroNum: number;
  remainingTime: number;
};

const TimingCard = ({
  children,
  oshi,
  timingPhase,
  pomodoroNum,
  remainingTime,
}: TimingCardProps) => {
  const msg = children || (
    <>
      {timingPhase === TimingPhase.Working ? (
        <>
          {ordinal(pomodoroNum)} <PomodoroIcon oshi={oshi} />
        </>
      ) : (
        <>Break time ☕</>
      )}
      , {formatTime(remainingTime)} remain
    </>
  );
  return (
    <ActionsCard
      actions={[
        { text: 'Skip ⏹', type: ACTION.SKIP },
        { text: 'Pause ⏸️', type: ACTION.PAUSE },
      ]}
      makeLineAltText={(template) =>
        `${template.text}\n\nYou can tell me to "Pause" or "Stop"`
      }
    >
      {msg}
    </ActionsCard>
  );
};

export default TimingCard;
