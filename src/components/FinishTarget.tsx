import Machinat from '@machinat/core';
import { WEBVIEW_STATISTICS_PATH } from '../constant';
import ButtonsCard from './ButtonsCard';
import Pause from './Pause';

type FinishTargetProps = {
  pomodoroTarget: number;
};

const FinishTarget = ({ pomodoroTarget }: FinishTargetProps) => {
  return (
    <>
      <p>Congratulation 🎉</p>
      <ButtonsCard
        makeLineAltText={(template) => `${template.text}`}
        buttons={[
          {
            type: 'webview',
            text: 'See Records 📊',
            path: WEBVIEW_STATISTICS_PATH,
          },
        ]}
      >
        Today's target is finished! You can still keep doing 🍅
      </ButtonsCard>
      <Pause />
    </>
  );
};

export default FinishTarget;
