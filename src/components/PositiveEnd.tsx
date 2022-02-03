import Machinat, { makeContainer } from '@machinat/core';
import { OshiVtuberI } from '../constant';

export default makeContainer({
  deps: [OshiVtuberI],
})(function PositiveEnd(vtuber) {
  return (_: {}) => {
    return <>{vtuber?.lang.positiveEnd}</>;
  };
});
