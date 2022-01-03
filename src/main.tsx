import Machinat from '@machinat/core';
import { makeContainer } from '@machinat/core/service';
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
import { ACTION } from './constant';
import type {
  ChatEventContext,
  WebEventContext,
  AppEventContext,
  FetchDataAction,
  UpdateOshiAction,
  UpdateSettingsAction,
  UpdateSubscriptionsAction,
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
      (ctx): ctx is WebEventContext<UpdateSettingsAction> =>
        ctx.event.type === 'update_settings'
    ),
    map(
      makeContainer({ deps: [useSettings] as const })(
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
      (ctx): ctx is WebEventContext<UpdateOshiAction> =>
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
      (ctx): ctx is WebEventContext<UpdateSubscriptionsAction> =>
        ctx.event.type === 'update_subscriptions'
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
            Machinat.Bot,
            Script.Processor,
            Timer,
            useSettings,
            useAppData,
            useUserProfile,
          ] as const,
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
                  timezone = profile?.timezone;

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

              const { yieldValue } = runtime;
              if (yieldValue) {
                const {
                  updateSettings,
                  registerTimer,
                  cancelTimer,
                  recordPomodoro,
                } = yieldValue;

                await Promise.all([
                  updateSettings && fetchSettings(channel, updateSettings),
                  registerTimer && timer.registerTimer(channel, registerTimer),
                  cancelTimer && timer.cancelTimer(channel, cancelTimer),
                  recordPomodoro &&
                    fetchAppData(channel, (appData) => {
                      const { statistics } = appData;
                      return {
                        ...appData,
                        statistics: {
                          ...statistics,
                          records: [...statistics.records, recordPomodoro],
                        },
                      };
                    }),
                ]);
              }
              await bot.render(channel, runtime.output());
            }
        )
      )
    )
    .catch(console.error);

  // push web app data when get_data action received
  webview$.pipe(
    filter(
      (ctx): ctx is WebEventContext<FetchDataAction> =>
        ctx.event.type === 'fetch_data'
    ),
    tap(
      makeContainer({ deps: [useAppData, useUserProfile] as const })(
        (getAppData, getUserProfile) =>
          async ({ bot, event, metadata: { auth } }) => {
            const { timezone } = event.payload;

            const [{ settings, statistics }, userProfile] = await Promise.all([
              getAppData(auth.channel, (data) => {
                const { settings } = data;
                if (settings.timezone === timezone) {
                  return data;
                }
                return { ...data, settings: { ...settings, timezone } };
              }),
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
