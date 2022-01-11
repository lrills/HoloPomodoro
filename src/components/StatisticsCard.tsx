import Machinat from '@machinat/core';
import { WEBVIEW_PATH } from '../constant';
import type { AppSettings, Statistics } from '../types';
import ButtonsCard from './ButtonsCard';
import PomodoroIcon from './PomodoroIcon';

type StatisticsCardProps = {
  oshi: null | string;
  settings: AppSettings;
  statistics: Statistics;
  noTitle?: boolean;
};

const StatisticsCard = ({
  oshi,
  settings,
  statistics,
  noTitle = false,
}: StatisticsCardProps) => {
  const { records, recentCounts } = statistics;

  const recentSum = recentCounts.reduce((sum, [, count]) => sum + count, 0);
  const recentDays = recentCounts.length;

  const recentAvg = recentDays > 0 ? (recentSum / recentDays).toFixed(1) : '-';
  const finishRate =
    recentDays > 0
      ? ((recentSum * 100) / (recentDays * settings.pomodoroPerDay)).toFixed()
      : '-';

  return (
    <>
      {noTitle ? null : <p>📜 Records:</p>}
      <ButtonsCard
        buttons={[
          { type: 'webview', text: 'More 📊', path: WEBVIEW_PATH.STATISTICS },
        ]}
      >
        ‣ Today's <PomodoroIcon />: {records.length}
        <br />
        ‣ Avg. <PomodoroIcon />: {recentAvg}
        <br />‣ Finish Rate: {finishRate}%
      </ButtonsCard>
    </>
  );
};

export default StatisticsCard;
