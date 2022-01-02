import Machinat from '@machinat/core';
import { build } from '@machinat/script';
import * as $ from '@machinat/script/keywords';
import ButtonsCard from '../components/ButtonsCard';
import SubscriptionsCard from '../components/SubscriptionsCard';
import getVtuber from '../utils/getVtuber';
import type { AppEventContext, AppActionType, AppSettings } from '../types';

type SelectResult = {
  settings: AppSettings;
};

type SelectSubscriptionsVars = SelectResult & {
  action: AppActionType;
  isConfirmed: boolean;
};

export default build<
  SelectSubscriptionsVars,
  AppEventContext,
  SelectResult,
  SelectResult
>(
  {
    name: 'SelectSubscriptions',
    initVars: ({ settings }) => ({
      settings,
      action: 'unknown',
      isConfirmed: false,
    }),
  },
  <$.BLOCK<SelectSubscriptionsVars>>
    {({ vars }) => {
      const vtuber = getVtuber(vars.settings.oshi);
      return <p>I'll send you a clip at break {vtuber?.lang.postfix}</p>;
    }}

    <$.WHILE<SelectSubscriptionsVars>
      condition={({ vars }) => !vars.isConfirmed}
    >
      {({ vars: { settings, action } }) => {
        const { subscriptions } = settings;
        return subscriptions.length === 0 ? (
          <ButtonsCard
            makeLineAltText={() => 'Select a VTuber'}
            buttons={[
              { type: 'webview', path: 'subscriptions', text: 'Subscribe 📺' },
              { type: 'action', action: 'ok', text: 'Ok 👌' },
            ]}
          >
            You don't subscribe to any VTuber. Do you want to continue?
          </ButtonsCard>
        ) : action === 'subscriptions_updated' ? (
          <SubscriptionsCard subscriptions={subscriptions} withOkButton />
        ) : (
          <ButtonsCard
            makeLineAltText={() => 'Select a VTuber'}
            buttons={[
              { type: 'action', action: 'ok', text: 'Only you ❤️' },
              { type: 'webview', path: 'subscriptions', text: 'Subscribe 📺' },
            ]}
          >
            You can subscribe more VTubers here 👇
          </ButtonsCard>
        );
      }}

      <$.PROMPT<SelectSubscriptionsVars, AppEventContext>
        key="ask-subscriptions"
        set={({ vars }, { event, intent }) => {
          if (event.type === 'subscriptions_updated') {
            return {
              ...vars,
              settings: event.payload.settings,
              action: intent.type,
            };
          }
          return {
            ...vars,
            action: intent.type,
            isConfirmed:
              intent.type === 'ok' ||
              intent.type === 'no' ||
              intent.type === 'skip' ||
              intent.type === 'start',
          };
        }}
      />
    </$.WHILE>

    <$.RETURN<SelectSubscriptionsVars, SelectResult>
      value={({ vars: { settings } }) => ({ settings })}
    />
  </$.BLOCK>
);
