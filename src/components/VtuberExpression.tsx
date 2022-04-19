import Machinat, { makeContainer, MachinatNode } from '@machinat/core';
import * as Messenger from '@machinat/messenger/components';
import MessengerAssetManager from '@machinat/messenger/asset';
import * as Twitter from '@machinat/twitter/components';
import TwitterAssetManager from '@machinat/twitter/asset';
import * as Line from '@machinat/line/components';
import getVtuber from '../utils/getVtuber';
import { OshiVtuberI } from '../constant';
import { AppSettings } from '../types';

type VTuberExpressionProps = {
  settings: AppSettings;
  children: MachinatNode;
};

export default makeContainer({
  deps: [MessengerAssetManager, TwitterAssetManager],
})(function VTuberExpression(messengerAssetManager, twitterAssetManager) {
  return async (
    { settings, children }: VTuberExpressionProps,
    { platform }
  ) => {
    let expression = children;
    const oshiVtuber = getVtuber(settings?.oshi);

    if (oshiVtuber) {
      const iconTag = `icon-${oshiVtuber.id}`;

      if (platform === 'messenger') {
        const personaId = await messengerAssetManager.getPersona(iconTag);
        expression = (
          <Messenger.Expression personaId={personaId}>
            {children}
          </Messenger.Expression>
        );
      } else if (platform === 'twitter') {
        // NOTE: the API is not available yet
        // const customProfileId = await twitterAssetManager.getCustomProfile(
        //   oshiVtuber.id
        // );
        expression = <Twitter.Expression>{children}</Twitter.Expression>;
      } else if (platform === 'line') {
        // TODO: line sender
        expression = <Line.Expression>{children}</Line.Expression>;
      }
    }

    return (
      <Machinat.Provider provide={OshiVtuberI} value={oshiVtuber}>
        {expression}
      </Machinat.Provider>
    );
  };
});
