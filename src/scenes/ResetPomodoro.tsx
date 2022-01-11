import Machinat from '@machinat/core';
import { build } from '@machinat/script';
import * as $ from '@machinat/script/keywords';
import ActionsCard from '../components/ActionsCard';
import PomodoroIcon from '../components/PomodoroIcon';
import { ACTION } from '../constant';
import type { AppSettings, AppEventContext, AppActionType } from '../types';

type ResetPomodoroParams = {
  settings: AppSettings;
};

type ResetPomodoroVars = ResetPomodoroParams & {
  action: AppActionType;
  isConfirmed: boolean;
};

type ResetPomodoroReturn = ResetPomodoroVars;

export default build<
  ResetPomodoroVars,
  AppEventContext,
  ResetPomodoroParams,
  ResetPomodoroReturn
>(
  {
    name: 'ResetPomodoro',
    initVars: ({ settings }) => ({
      settings,
      action: ACTION.UNKNOWN,
      isConfirmed: false,
    }),
  },
  <$.BLOCK<ResetPomodoroVars>>
    {({ vars: { settings } }) => (
      <ActionsCard
        actions={[
          { type: ACTION.OK, text: 'Yes' },
          { type: ACTION.NO, text: 'No' },
        ]}
      >
        Do you really want to reset <PomodoroIcon oshi={settings.oshi} /> today?
      </ActionsCard>
    )}

    <$.PROMPT<ResetPomodoroVars, AppEventContext>
      key="confirm-reset"
      set={({ vars }, { event, intent }) => {
        const isConfirmed =
          intent.type === ACTION.OK || intent.type === ACTION.RESET;
        return {
          settings:
            event.type === 'settings_updated'
              ? event.payload.settings
              : vars.settings,
          action:
            isConfirmed || intent.type === ACTION.NO ? ACTION.OK : intent.type,
          isConfirmed,
        };
      }}
    />

    <$.RETURN<ResetPomodoroVars, ResetPomodoroReturn>
      value={({ vars }) => vars}
    />
  </$.BLOCK>
);
