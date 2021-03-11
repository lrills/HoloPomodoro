import Machinat from '@machinat/core';
import { makeContainer, ServiceScope } from '@machinat/core/service';
import BaseBot from '@machinat/core/base/Bot';
import { MarkSeen } from '@machinat/messenger/components';
import Script from '@machinat/script';
import { fromApp, merge, Subject } from '@machinat/x-machinat';
import { filter, tap } from '@machinat/x-machinat/operators';

import Timer from './utils/Timer';
import Pomodoro from './scenes/Pomodoro';
import App from './app';
import type { AppEventContext } from './types';

const main = (app: typeof App): void => {
  const timerSubject = new Subject<AppEventContext>();
  const [timer] = app.useServices([Timer]);

  timer.onTimesUp((targets) => {
    const [bot, scope] = app.useServices([BaseBot, ServiceScope]);

    for (const { channel, minutes } of targets) {
      const { platform } = channel;

      timerSubject.next({
        key: channel.uid,
        scope,
        value: {
          platform,
          event: {
            platform,
            kind: 'timer',
            type: 'time_up',
            payload: { minutes },
            channel,
            user: null,
          },
          metadata: { source: 'timer' },
          bot,
        },
      });
    }

    return timer.start();
  });

  const events$ = merge(fromApp(app), timerSubject);

  events$.subscribe(
    makeContainer({ deps: [Machinat.Bot, Script.Processor] as const })(
      (bot, scriptProcessor) => async (context) => {
        const { channel } = context.event;
        if (!channel) {
          return;
        }

        let runtime = await scriptProcessor.continue(channel, context);
        if (!runtime) {
          runtime = await scriptProcessor.start(channel, Pomodoro);
        }

        await bot.render(channel, runtime.output());
      }
    ),
    console.error
  );

  events$.pipe(
    filter(({ platform }) => platform === 'messenger'),
    tap(async ({ bot, event: { channel } }) => {
      await bot.render(channel, <MarkSeen />);
    })
  );
};

export default main;
