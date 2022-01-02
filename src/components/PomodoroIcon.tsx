import Machinat from '@machinat/core';
import getVtuber from '../utils/getVtuber';

type PomodoroIconProps = {
  oshi: string | null;
};

const PomodoroIcon = ({ oshi }: PomodoroIconProps) => {
  const vtuber = getVtuber(oshi);
  return <>{vtuber?.pomodoroIcon || '🍅'}</>;
};

export default PomodoroIcon;
