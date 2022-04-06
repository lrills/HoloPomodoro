import Machinat from '@machinat/core';
import { WEBVIEW_PAGE } from '../constant';
import getVtuber from '../utils/getVtuber';
import ButtonsCard from './ButtonsCard';
import PomodoroIcon from './PomodoroIcon';
import Pause from './Pause';

type FinishTargetProps = {
  oshi: null | string;
};

const FinishTarget = ({ oshi }: FinishTargetProps) => {
  return (
    <>
      <p>{getVtuber(oshi)?.lang.otsukare || 'Congratulation'} 🎉</p>
      <ButtonsCard
        buttons={[
          {
            type: 'webview',
            text: 'See Records 📊',
            page: WEBVIEW_PAGE.STATISTICS,
          },
        ]}
      >
        Today's target is finished! You can still do more <PomodoroIcon />
      </ButtonsCard>
      <Pause />
    </>
  );
};

export default FinishTarget;
