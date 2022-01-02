import Machinat from '@machinat/core';
import { build } from '@machinat/script';
import * as $ from '@machinat/script/keywords';
import VtuberCard from '../components/VtuberCard';
import ButtonsCard from '../components/ButtonsCard';
import Pause from '../components/Pause';
import getVtuber from '../utils/getVtuber';
import type { AppEventContext, AppActionType, AppSettings } from '../types';

type SelectOshiVars = {
  settings: AppSettings;
  action: AppActionType;
  isConfirmed: boolean;
};

type SelectResult = {
  settings: AppSettings;
};

export default build<
  SelectOshiVars,
  AppEventContext,
  SelectResult,
  SelectResult
>(
  {
    name: 'SelectOshi',
    initVars: ({ settings }) => ({
      settings,
      action: 'unknown',
      isConfirmed: false,
    }),
  },
  <>
    <$.WHILE<SelectOshiVars> condition={({ vars }) => !vars.isConfirmed}>
      {({ vars: { settings, action } }) => {
        const vtuber = getVtuber(settings.oshi);
        return vtuber && action === 'oshi_updated' ? (
          <>
            <p>{vtuber.lang.greeting}</p>
            <Pause />

            <VtuberCard id={vtuber.id} />
            <Pause />

            <ButtonsCard
              makeLineAltText={() => 'Select a VTuber'}
              buttons={[
                { type: 'webview', path: 'oshi', text: 'Change 📺' },
                { type: 'action', action: 'ok', text: 'Go 👍' },
              ]}
            >
              {vtuber.lang.introduction || `Let's go, ${vtuber.lang.fanName}`}
            </ButtonsCard>
          </>
        ) : (
          <ButtonsCard
            makeLineAltText={() => 'Select a VTuber'}
            buttons={[{ type: 'webview', path: 'oshi', text: 'Select 📺' }]}
          >
            Please select your favorite VTuber 👇
          </ButtonsCard>
        );
      }}

      <$.PROMPT<SelectOshiVars, AppEventContext>
        key="ask-oshi"
        set={({ vars }, { event, intent }) => {
          if (event.type === 'oshi_updated') {
            return {
              ...vars,
              settings: event.payload.settings,
              action: intent.type,
            };
          }
          return {
            ...vars,
            action: intent.type,
            isConfirmed: !!vars.settings.oshi && intent.type === 'ok',
          };
        }}
      />

      <$.IF<SelectOshiVars>
        condition={({ vars: { settings, action } }) =>
          !settings.oshi && (action === 'no' || action === 'skip')
        }
      >
        <$.THEN>
          {() => <p>You haven't choose a VTuber. Do you want to continue?</p>}
          <$.PROMPT<SelectOshiVars, AppEventContext>
            key="confirm-no-oshi"
            set={({ vars }, { event, intent }) => {
              if (intent.type === 'ok') {
                return { ...vars, isConfirmed: true };
              }
              if (event.type === 'oshi_updated') {
                return {
                  ...vars,
                  settings: event.payload.settings,
                  action: intent.type,
                };
              }
              return vars;
            }}
          />
        </$.THEN>
      </$.IF>
    </$.WHILE>

    <$.RETURN<SelectOshiVars, SelectResult>
      value={({ vars: { settings } }) => ({ settings })}
    />
  </>
);
