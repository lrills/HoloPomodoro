import Machinat from '@machinat/core';
import { build } from '@machinat/script';
import * as $ from '@machinat/script/keywords';
import SettingsCard from '../components/SettingsCard';
import Pause from '../components/Pause';
import getVtuber from '../utils/getVtuber';
import { ACTION } from '../constant';
import type {
  AppSettings,
  AppEventContext,
  // AppScriptYield,
  AppActionType,
} from '../types';
import SelectOshi from './SelectOshi';
import SelectSubscriptions from './SelectSubscriptions';

type BeginningParams = {
  settings: AppSettings;
};

type BeginningVars = BeginningParams & {
  action: AppActionType;
  shouldSaveTz: boolean;
};

type BeginningReturn = BeginningParams;

export default build<
  BeginningVars,
  AppEventContext,
  BeginningParams,
  BeginningReturn
>(
  {
    name: 'Beginning',
    initVars: ({ settings }) => ({
      settings,
      action: ACTION.UNKNOWN,
      shouldSaveTz: false,
    }),
  },
  <$.BLOCK<BeginningVars>>
    {() => (
      <>
        <p>Hello! 👋</p>
        <p>I'm HoloPomodoro Bot 🤖</p>
        <Pause />
      </>
    )}

    <$.CALL<BeginningVars, typeof SelectOshi>
      script={SelectOshi}
      params={({ vars: { settings } }) => ({ settings })}
      key="select-oshi"
      set={({ vars }, { settings }) => ({ ...vars, settings })}
    />

    {({ vars }) => {
      const vtuber = getVtuber(vars.settings.oshi);
      return vtuber ? (
        <p>
          {vtuber.lang.hello}! {vtuber.lang.fanName}
        </p>
      ) : (
        <p>Ok, you can change your mind anytime</p>
      );
    }}

    <$.CALL<BeginningVars, typeof SelectSubscriptions>
      script={SelectSubscriptions}
      key="select-subscriptions"
      params={({ vars: { settings } }) => ({ settings })}
      set={({ vars }, { settings }) => {
        return { ...vars, settings };
      }}
    />

    {({ vars: { settings } }) => {
      const { oshi, subscriptions } = settings;
      const vtuber = getVtuber(oshi);
      return subscriptions.length === 0 ? (
        <p>You can tell me to "subscribe" anytime {vtuber?.lang.positiveEnd}</p>
      ) : vtuber && !subscriptions.includes(vtuber.id) ? (
        <p>
          I can't believe you don't choose {vtuber?.lang.selfCall || 'me'} 😭
        </p>
      ) : subscriptions.length === 1 ? (
        <p>
          Thanks for choosing only {vtuber?.lang.selfCall || 'me'}{' '}
          {vtuber?.lang.positiveEnd} 😉
        </p>
      ) : subscriptions.length > 10 ? (
        <p>You choose so many girls {vtuber?.lang.positiveEnd} 😡</p>
      ) : (
        <p>I see who you like {vtuber?.lang.positiveEnd} 😏</p>
      );
    }}

    {({ vars }) => (
      <SettingsCard
        title="Please confirm your settings ⚙️"
        settings={vars.settings}
        withEditButton
        withOkButton
      />
    )}

    <$.PROMPT<BeginningVars, AppEventContext>
      key="confirm-settings"
      set={async ({ vars }, { event, intent }) => ({
        ...vars,
        action: intent.type,
        settings:
          event.type === 'settings_updated'
            ? event.payload.settings
            : vars.settings,
      })}
    />

    {({ vars: { action, settings } }) => {
      const vtuber = getVtuber(settings.oshi);
      const isUpdated = action === ACTION.SETTINGS_UPDATED;
      return (
        <>
          {isUpdated && (
            <>
              <SettingsCard isChanged settings={settings} />
              <Pause />
            </>
          )}
          {vtuber && (
            <p>
              I'll give you a {vtuber.pomodoroIcon} every working time{' '}
              {vtuber.lang.positiveEnd}
            </p>
          )}
          <Pause />
        </>
      );
    }}

    <$.RETURN<BeginningVars, BeginningReturn>
      value={({ vars: { settings } }) => ({ settings })}
    />
  </$.BLOCK>
);
