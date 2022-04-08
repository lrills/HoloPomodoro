import Machinat, { makeContainer, BasicBot } from '@machinat/core';
import Script from '@machinat/script';
import { merge, Stream } from '@machinat/stream';
import { filter, tap, map } from '@machinat/stream/operators';
import { AnswerCallbackQuery } from '@machinat/telegram/components';
import clipLanguages from '../clipLanguages.json';
import * as Scenes from './scenes';
import Timer from './services/Timer';
import useIntent from './services/useIntent';
import useAppData from './services/useAppData';
import useSettings from './services/useSettings';
import useUserProfile from './services/useUserProfile';
import VtuberExpression from './components/VtuberExpression';
import { ACTION } from './constant';
import type {
  ChatEventContext,
  WebEventContext,
  AppEventContext,
} from './types';

const CLIP_LANGUAGE_CODES = Object.keys(clipLanguages);

type Scenes = typeof Scenes;

const main = (
  event$: Stream<ChatEventContext | WebEventContext>,
  timer$: Stream<AppEventContext>
): void => {
  const webview$ = event$.pipe(
    filter((ctx): ctx is WebEventContext => ctx.platform === 'webview')
  );

  const settingsUpdate$: Stream<AppEventContext> = webview$.pipe(
    filter(
      (ctx): ctx is WebEventContext & { event: { type: 'update_settings' } } =>
        ctx.event.type === 'update_settings'
    ),
    map(
      makeContainer({ deps: [useSettings] })(
        (fetchSettings) =>
          async ({ event: { payload, channel }, metadata: { auth }, bot }) => {
            const newSettings = await fetchSettings(
              auth.channel,
              payload.settings
            );
            await bot.send(channel, {
              category: 'app',
              type: 'settings_updated',
              payload: { settings: newSettings },
            });
            return {
              platform: auth.platform,
              event: {
                platform: auth.platform,
                category: 'app',
                type: 'settings_updated',
                payload: { settings: newSettings },
                channel: auth.channel,
                user: auth.user,
              },
              intent: {
                type: ACTION.SETTINGS_UPDATED,
                confidence: 1,
                payload: null,
              },
            };
          }
      )
    )
  );

  const oshiUpdate$: Stream<AppEventContext> = webview$.pipe(
    filter(
      (ctx): ctx is WebEventContext & { event: { type: 'update_oshi' } } =>
        ctx.event.type === 'update_oshi'
    ),
    map(
      makeContainer({ deps: [useAppData] })(
        (fetchAppData) =>
          async ({ event: { payload, channel }, metadata: { auth }, bot }) => {
            const { oshi } = payload;
            const { settings } = await fetchAppData(auth.channel, (data) => {
              const { settings: curSettings } = data;
              const { subscriptions: curSubscriptions } = curSettings;
              return {
                ...data,
                settings: {
                  ...curSettings,
                  oshi,
                  subscriptions:
                    oshi && !curSubscriptions.includes(oshi)
                      ? curSubscriptions.concat(oshi)
                      : curSubscriptions,
                },
              };
            });
            await bot.send(channel, {
              category: 'app',
              type: 'settings_updated',
              payload: { settings },
            });
            return {
              platform: auth.platform,
              event: {
                platform: auth.platform,
                category: 'app',
                type: 'settings_updated',
                payload: { settings },
                channel: auth.channel,
                user: auth.user,
              },
              intent: {
                type: ACTION.OSHI_UPDATED,
                confidence: 1,
                payload: null,
              },
            };
          }
      )
    )
  );

  const subscriptionsUpdate$: Stream<AppEventContext> = webview$.pipe(
    filter(
      (ctx): ctx is WebEventContext & { event: { type: 'update_subs' } } =>
        ctx.event.type === 'update_subs'
    ),
    map(
      makeContainer({ deps: [useSettings] })(
        (fetchSettings) =>
          async ({ event: { payload, channel }, metadata: { auth }, bot }) => {
            const { subscriptions } = payload;
            const settings = await fetchSettings(auth.channel, {
              subscriptions,
            });
            await bot.send(channel, {
              category: 'app',
              type: 'settings_updated',
              payload: { settings },
            });
            return {
              platform: auth.platform,
              event: {
                platform: auth.platform,
                category: 'app',
                type: 'settings_updated',
                payload: { settings },
                channel: auth.channel,
                user: auth.user,
              },
              intent: {
                type: ACTION.SUBSCRIPTIONS_UPDATED,
                confidence: 1,
                payload: null,
              },
            };
          }
      )
    )
  );

  const chat$: Stream<AppEventContext> = event$.pipe(
    filter((ctx): ctx is ChatEventContext => ctx.platform !== 'webview'),
    map(
      makeContainer({ deps: [useIntent] })((getIntent) => async (ctx) => {
        const intent = await getIntent(ctx.event);
        return { ...ctx, intent };
      })
    )
  );

  merge(chat$, timer$, settingsUpdate$, oshiUpdate$, subscriptionsUpdate$)
    .pipe(
      tap(
        makeContainer({
          deps: [
            BasicBot,
            Script.Processor,
            Timer,
            useSettings,
            useAppData,
            useUserProfile,
          ],
        })(
          (
              bot,
              scriptProcessor: Script.Processor<Scenes[keyof Scenes]>,
              timer,
              fetchSettings,
              fetchAppData,
              getUserProfile
            ) =>
            async (context) => {
              const { event } = context;
              const { channel } = event;
              if (!channel) {
                return;
              }

              let runtime = await scriptProcessor.continue(channel, context);
              if (!runtime) {
                let timezone: undefined | number;
                let clipLanguages: undefined | string[];

                if (event.user) {
                  const profile = await getUserProfile(event.user);
                  timezone = profile?.timeZone;

                  if (profile?.languageCode) {
                    const language = profile.languageCode.split(/[-_]/)[0];
                    if (CLIP_LANGUAGE_CODES.includes(language)) {
                      clipLanguages = [language];
                    }
                  }
                }

                const settings = await fetchSettings(channel, {
                  timezone,
                  clipLanguages,
                });

                runtime = await scriptProcessor.start(
                  channel,
                  Scenes.Pomodoro,
                  { params: { settings } }
                );
              }

              const {
                yieldValue: {
                  registerTimer,
                  cancelTimer,
                  resetPomodoro,
                  recordPomodoro,
                } = {},
              } = runtime;
              const [, , { settings }] = await Promise.all([
                registerTimer && timer.registerTimer(channel, registerTimer),
                cancelTimer && timer.cancelTimer(channel, cancelTimer),
                fetchAppData(channel, (appData) => {
                  if (!resetPomodoro || !recordPomodoro) {
                    return appData;
                  }

                  const { statistics } = appData;
                  return {
                    ...appData,
                    statistics: {
                      ...statistics,
                      records: resetPomodoro
                        ? []
                        : recordPomodoro
                        ? [...statistics.records, recordPomodoro]
                        : statistics.records,
                    },
                  };
                }),
              ]);

              await bot.render(
                channel,
                <VtuberExpression settings={settings}>
                  {runtime.output()}
                </VtuberExpression>
              );
            }
        )
      )
    )
    .catch(console.error);

  // push web app data when connect
  webview$.pipe(
    filter(
      (ctx): ctx is WebEventContext & { event: { type: 'connect' } } =>
        ctx.event.type === 'connect'
    ),
    tap(
      makeContainer({ deps: [useAppData, useUserProfile] })(
        (getAppData, getUserProfile) =>
          async ({ bot, event, metadata: { auth } }) => {
            const [{ settings, statistics }, userProfile] = await Promise.all([
              getAppData(auth.channel),
              getUserProfile(auth.user),
            ]);
            await bot.send(event.channel, {
              category: 'app',
              type: 'app_data',
              payload: { settings, statistics, userProfile },
            });
          }
      )
    )
  );

  // silently update timezone from browser
  webview$.pipe(
    filter(
      (ctx): ctx is WebEventContext & { event: { type: 'update_tz' } } =>
        ctx.event.type === 'update_tz'
    ),
    tap(
      makeContainer({ deps: [useAppData] })(
        (getAppData) =>
          async ({ event, metadata: { auth } }) => {
            const { timezone } = event.payload;

            await getAppData(auth.channel, (data) => {
              const { settings } = data;
              if (settings.timezone === timezone) {
                return data;
              }
              return { ...data, settings: { ...settings, timezone } };
            });
          }
      )
    )
  );

  // answer callback_query event in Telegram
  event$
    .pipe(
      filter(
        (
          ctx
        ): ctx is ChatEventContext & { event: { type: 'callback_query' } } =>
          ctx.event.type === 'callback_query'
      ),
      tap(async ({ event, reply }) => {
        await reply(<AnswerCallbackQuery queryId={event.queryId} />);
      })
    )
    .catch(console.error);
};

export default main;
