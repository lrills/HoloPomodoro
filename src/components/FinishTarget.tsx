import Machinat from '@machinat/core';
import { WEBVIEW_PATH } from '../constant';
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
        makeLineAltText={(template) => `${template.text}`}
        buttons={[
          {
            type: 'webview',
            text: 'See Records 📊',
            path: WEBVIEW_PATH.STATISTICS,
          },
        ]}
      >
        Today's target is finished! You can still do more{' '}
        <PomodoroIcon oshi={oshi} />
      </ButtonsCard>
      <Pause />
    </>
  );
};

export default FinishTarget;
