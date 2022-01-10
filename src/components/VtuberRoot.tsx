import Machinat from '@machinat/core';
import { makeContainer } from '@machinat/core/service';
import MessengerAssetManager from '@machinat/messenger/asset';
import * as Messenger from '@machinat/messenger/components';
import * as Line from '@machinat/line/components';
import useSettings from '../services/useSettings';
import { AppSettingsI } from '../constant';
import { AppSettings, AppChannel } from '../types';

export default makeContainer({
  deps: [
    useSettings,
    Machinat.RenderingChannel,
    MessengerAssetManager,
  ] as const,
})(function VTuberRoot(
  getSettings,
  channel: AppChannel | null,
  messengerAssetManager
) {
  return async ({ children }, { platform }) => {
    let settings: null | AppSettings = null;
    let expression = children;

    if (channel) {
      settings = await getSettings(channel, null);
      if (settings?.oshi) {
        const { oshi } = settings;

        if (platform === 'messenger') {
          const personaId = await messengerAssetManager.getPersona(oshi);
          expression = (
            <Messenger.Expression personaId={personaId}>
              {children}
            </Messenger.Expression>
          );
        } else if (platform === 'line') {
          // TODO: line sender
          expression = <Line.Expression>{children}</Line.Expression>;
        }
      }
    }

    return (
      <Machinat.Provider provide={AppSettingsI} value={settings}>
        {expression}
      </Machinat.Provider>
    );
  };
});
