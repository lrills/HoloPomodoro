import Machinat from '@machinat/core';
import { makeContainer } from '@machinat/core/service';
import ordinal from 'ordinal';
import useClip from '../services/useClip';
import getVtuber from '../utils/getVtuber';
import formatTime from '../utils/formatTime';
import { ClipData, AppChannel, AppSettings } from '../types';
import { TimingPhase, ACTION } from '../constant';
import ClipCard from './ClipCard';
import ActionsCard from './ActionsCard';
import PomodoroIcon from './PomodoroIcon';
import PositiveEnd from './PositiveEnd';

type StartTimingProps = {
  isBeginning: boolean;
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
    isBeginning,
  }: StartTimingProps) => {
    let clip: null | ClipData = null;
    let members: undefined | string;
    const oshiVtuber = getVtuber(oshi);

    // send a clip while taking a break
    if (phase !== TimingPhase.Working && isBeginning) {
      clip = await getClip(
        channel,
        phase === TimingPhase.LongBreak ? longBreakMins : shortBreakMins
      );
    }
    // clip intro
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
        names.push(oshiVtuber?.lang.selfCall || 'me');
      }

      if (names.length === 1) {
        members = names[0];
      } else if (mentions.length > 5) {
        members =
          oshi && mentions.includes(oshi)
            ? `${oshiVtuber?.lang.selfCall || 'me'} and other ${
                mentions.length - 1
              } VTubers`
            : `${mentions.length} VTubers`;
      } else {
        members = `${names.slice(0, -1).join(', ')} and ${
          names[names.length - 1]
        }`;
      }
    }

    return (
      <>
        {clip && (
          <>
            {members ? (
              <p>
                Have a clip about {members} <PositiveEnd />
              </p>
            ) : (
              <p>
                Have a clip while resting <PositiveEnd />
              </p>
            )}
            <ClipCard clip={clip} withYoutubeButton withMoreButton />
          </>
        )}

        <ActionsCard
          actions={[
            { text: 'Skip ⏹', type: ACTION.SKIP },
            { text: 'Pause ⏸️', type: ACTION.PAUSE },
          ]}
        >
          {timingPhase === TimingPhase.Working ? (
            <>
              {ordinal(pomodoroNum)} <PomodoroIcon />
              {isBeginning && ' start'}
            </>
          ) : (
            <>Break time{isBeginning && ' start'} ☕</>
          )}
          , {formatTime(remainingTime)} remain
        </ActionsCard>
      </>
    );
  };
});
