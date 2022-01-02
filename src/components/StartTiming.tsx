import Machinat from '@machinat/core';
import { makeContainer } from '@machinat/core/service';
import ordinal from 'ordinal';
import useClip from '../services/useClip';
import getVtuber from '../utils/getVtuber';
import { ClipData, AppChannel, AppSettings } from '../types';
import { TimingPhase } from '../constant';
import ClipCard from './ClipCard';
import TimingCard from './TimingCard';
import PomodoroIcon from './PomodoroIcon';

type StartTimingProps = {
  phase: TimingPhase;
  channel: AppChannel;
  settings: AppSettings;
  timingPhase: TimingPhase;
  pomodoroNum: number;
  remainingTime: number;
};

export default makeContainer({ deps: [useClip] })(function StartTiming(
  getClip
) {
  return async ({
    settings: { oshi, longBreakMins, shortBreakMins },
    phase,
    channel,
    timingPhase,
    pomodoroNum,
    remainingTime,
  }: StartTimingProps) => {
    let clip: null | ClipData = null;
    let members: undefined | string;

    if (phase !== TimingPhase.Working) {
      clip = await getClip(
        channel,
        phase === TimingPhase.LongBreak ? longBreakMins : shortBreakMins
      );
    }

    if (clip) {
      const { mentions } = clip;
      const names: string[] = [];

      for (const id of mentions) {
        const vtuber = getVtuber(id);
        if (vtuber && id !== oshi) {
          names.push(vtuber.lang.nickname);
        }
      }
      if (oshi && mentions.includes(oshi)) {
        names.push('me');
      }

      if (names.length === 1) {
        members = names[0];
      } else if (mentions.length > 5) {
        members =
          oshi && mentions.includes(oshi)
            ? `me and other ${mentions.length - 1} VTubers`
            : `${mentions.length} VTubers`;
      } else {
        members = `${names.slice(0, -1).join(', ')} and ${
          names[names.length - 1]
        }`;
      }
    }

    const oshiVtuber = getVtuber(oshi);
    return (
      <>
        {clip && (
          <>
            {members ? (
              <p>
                Have a clip about {members} {oshiVtuber?.lang.postfix}
              </p>
            ) : (
              <p>Have a clip while resting {oshiVtuber?.lang.postfix}</p>
            )}
            <ClipCard clip={clip} />
          </>
        )}
        <TimingCard
          oshi={oshi}
          timingPhase={timingPhase}
          pomodoroNum={pomodoroNum}
          remainingTime={remainingTime}
        >
          {timingPhase === TimingPhase.Working ? (
            <>
              Today's {ordinal(pomodoroNum)} <PomodoroIcon oshi={oshi} /> start!
            </>
          ) : (
            <>Break time start! ☕</>
          )}
        </TimingCard>
      </>
    );
  };
});
