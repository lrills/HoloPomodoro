import Machinat, { MachinatNode } from '@machinat/core';
import { makeContainer } from '@machinat/core/service';
import MessengerAssetManager from '@machinat/messenger/asset';
import * as Messenger from '@machinat/messenger/components';
import * as Line from '@machinat/line/components';
import getVtuber from '../utils/getVtuber';
import { OshiVtuberI } from '../constant';
import { AppSettings } from '../types';

type VTuberExpressionProps = {
  settings: AppSettings;
  children: MachinatNode;
};

export default makeContainer({
  deps: [MessengerAssetManager],
})(function VTuberExpression(messengerAssetManager) {
  return async (
    { settings, children }: VTuberExpressionProps,
    { platform }
  ) => {
    let expression = children;
    const oshiVtuber = getVtuber(settings?.oshi);

    if (oshiVtuber) {
      if (platform === 'messenger') {
        const personaId = await messengerAssetManager.getPersona(oshiVtuber.id);
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

    return (
      <Machinat.Provider provide={OshiVtuberI} value={oshiVtuber}>
        {expression}
      </Machinat.Provider>
    );
  };
});
