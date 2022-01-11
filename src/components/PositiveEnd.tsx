import Machinat from '@machinat/core';
import { makeContainer } from '@machinat/core/service';
import { OshiVtuberI } from '../constant';

export default makeContainer({
  deps: [OshiVtuberI],
})(function PositiveEnd(vtuber) {
  return (_: {}) => {
    return <>{vtuber?.lang.positiveEnd}</>;
  };
});
