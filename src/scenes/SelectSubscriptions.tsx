import Machinat from '@machinat/core';
import { build } from '@machinat/script';
import * as $ from '@machinat/script/keywords';
import ButtonsCard from '../components/ButtonsCard';
import SubscriptionsCard from '../components/SubscriptionsCard';
import PositiveEnd from '../components/PositiveEnd';
import { WEBVIEW_PAGE } from '../constant';
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
    {() => {
      return (
        <p>
          I'll send you a clip at break <PositiveEnd />
        </p>
      );
    }}

    <$.WHILE<SelectSubscriptionsVars>
      condition={({ vars }) => !vars.isConfirmed}
    >
      {({ vars: { settings, action } }) => {
        const { subscriptions } = settings;

        return subscriptions.length === 0 ? (
          <ButtonsCard
            buttons={[
              {
                type: 'webview',
                page: WEBVIEW_PAGE.SUBSCRIPTIONS,
                text: 'Subscribe 💑',
              },
              { type: 'action', action: 'ok', text: 'Ok 👌' },
            ]}
          >
            You don't subscribe to any VTuber. Do you want to continue?
          </ButtonsCard>
        ) : action === 'subscriptions_updated' ? (
          <SubscriptionsCard isChanged settings={settings} withOkButton />
        ) : (
          <ButtonsCard
            buttons={[
              { type: 'action', action: 'ok', text: 'Only you ❤️' },
              {
                type: 'webview',
                page: WEBVIEW_PAGE.SUBSCRIPTIONS,
                text: 'Subscribe 💑',
              },
            ]}
          >
            You can subscribe more VTubers here 👇
          </ButtonsCard>
        );
      }}

      <$.PROMPT<SelectSubscriptionsVars, AppEventContext>
        key="ask-subscriptions"
        set={({ vars }, { event, intent }) => {
          if (event.type === 'settings_updated') {
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
