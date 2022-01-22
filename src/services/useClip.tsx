import { makeFactoryProvider } from '@machinat/core/service';
import { AppChannel, ClipData } from '../types';
import ClipsManager from './ClipsManager';
import useAppData from './useAppData';

export default makeFactoryProvider({
  lifetime: 'scoped',
  deps: [useAppData, ClipsManager],
})(function useClip(updateAppData, clipsManager) {
  return async (
    channel: AppChannel,
    breakTime?: number
  ): Promise<null | ClipData> => {
    let clip: null | ClipData = null;

    await updateAppData(channel, (data) => {
      const { settings, clipsHistory } = data;

      clip = clipsManager.getClip({
        durationLimit: breakTime ? breakTime * 60 : undefined,
        vtubers: settings.subscriptions,
        languages: settings.clipLanguages,
        excludes: clipsHistory,
      });

      return {
        ...data,
        clipsHistory: !clip
          ? clipsHistory
          : clipsHistory.length < 200
          ? clipsHistory.concat(clip.id)
          : clipsHistory.slice(1).concat(clip.id),
      };
    });

    return clip;
  };
});
