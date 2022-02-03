import Machinat, { makeContainer } from '@machinat/core';
import { OshiVtuberI } from '../constant';

export default makeContainer({
  deps: [OshiVtuberI],
})(function PomodoroIcon(vtuber) {
  return (_: {}) => {
    return <>{vtuber?.pomodoroIcon || '🍅'}</>;
  };
});
