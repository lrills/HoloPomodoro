import { ServiceScope } from '@machinat/core/service';
import { Stream, fromApp } from '@machinat/stream';
import main from './main';
import app from './app';
import { ACTION } from './constant';
import Timer from './services/Timer';
import ClipsManager from './services/ClipsManager';
import { AppEventContext, ChatEventContext, WebEventContext } from './types';

app.onError(console.error);
app
  .start()
  .then(async () => {
    const timer$ = new Stream<AppEventContext>();
    const [timer, clipsManager] = app.useServices([Timer, ClipsManager]);
    timer.start();

    timer.onTimesUp((targets) => {
      const [scope] = app.useServices([ServiceScope]);

      for (const { channel } of targets) {
        const { platform } = channel;
        timer$.next({
          key: channel.uid,
          scope,
          value: {
            platform,
            event: {
              platform,
              category: 'app',
              type: 'time_up',
              payload: null,
              channel,
              user: null,
            },
            intent: { type: ACTION.TIME_UP, confidence: 1, payload: null },
          },
        });
      }
    });

    await clipsManager.refresh();
    main(fromApp(app) as Stream<ChatEventContext | WebEventContext>, timer$);
  })
  .catch(console.error);

process.on('unhandledRejection', console.error);
