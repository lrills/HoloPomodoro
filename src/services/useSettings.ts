import { makeFactoryProvider } from '@machinat/core';
import { AppSettings, AppChannel } from '../types';
import useAppData from './useAppData';

export default makeFactoryProvider({
  lifetime: 'scoped',
  deps: [useAppData],
})(function useSettings(updateAppData) {
  return async (
    channel: AppChannel,
    updates: null | Partial<AppSettings>
  ): Promise<AppSettings> => {
    const { settings } = await updateAppData(channel, (data) => {
      if (!updates) {
        return data;
      }

      const originalSettings = data.settings;
      const validKeys = Object.keys(originalSettings);

      const newSettings = { ...originalSettings };
      Object.entries(updates).forEach(([key, value]) => {
        if (validKeys.includes(key) && value !== undefined) {
          newSettings[key] = value;
        }
      });

      return { ...data, settings: newSettings };
    });

    return settings;
  };
});
