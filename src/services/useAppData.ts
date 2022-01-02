import { makeFactoryProvider } from '@machinat/core/service';
import StateController from '@machinat/core/base/StateController';
import { STATE_KEY } from '../constant';
import { AppChannel, AppData } from '../types';
import currentDayId from '../utils/currentDayId';

const identity = (x) => x;

const useSettings =
  (controller: StateController) =>
  async (
    channel: AppChannel,
    updateFn: (data: AppData) => AppData = identity
  ): Promise<AppData> => {
    const updatedSettings = await controller
      .channelState(channel)
      .update<AppData>(
        STATE_KEY.APP_DATA,
        (
          data = {
            settings: {
              oshi: null,
              subscriptions: [],
              workingMins: 25,
              shortBreakMins: 5,
              longBreakMins: 30,
              pomodoroPerDay: 12,
              timezone: 0,
              clipLanguages: ['en'],
            },
            statistics: {
              day: '00-00-00',
              records: [],
              recentCounts: [],
            },
            clipsHistory: [],
          }
        ) => {
          const { settings, statistics } = data;
          const { day: recordDay, records, recentCounts } = statistics;

          const currentDay = currentDayId(settings.timezone);
          const isDayChanged = currentDay !== recordDay;

          if (!isDayChanged) {
            return updateFn(data);
          }

          return updateFn({
            ...data,
            statistics: {
              day: currentDay,
              records: [],
              recentCounts:
                records.length > 0
                  ? [...recentCounts.slice(-9), [recordDay, records.length]]
                  : recentCounts,
            },
          });
        }
      );

    return updatedSettings;
  };

export default makeFactoryProvider({
  lifetime: 'scoped',
  deps: [StateController],
})(useSettings);
