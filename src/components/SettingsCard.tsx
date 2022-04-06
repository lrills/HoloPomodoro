import Machinat from '@machinat/core';
// @ts-ignore
import clipLanguages from '../../clipLanguages.json';
import { ACTION, WEBVIEW_PAGE } from '../constant';
import type { AppSettings } from '../types';
import ButtonsCard, { ButtonData } from './ButtonsCard';
import ActionsCard from './ActionsCard';
import PositiveEnd from './PositiveEnd';

type SettingsCardProps = {
  title?: string;
  settings: AppSettings;
  isChanged?: boolean;
  withEditButton?: boolean;
  withOkButton?: boolean;
};

const SettingsCard = (
  {
    title,
    settings,
    isChanged = false,
    withEditButton = false,
    withOkButton = false,
  }: SettingsCardProps,
  { platform }
) => {
  const okLabel = 'Ok 👍';
  const titleContent = title || (
    <>
      ⚙️ Settings
      {isChanged ? (
        <>
          {' '}
          changed <PositiveEnd />
        </>
      ) : (
        ':'
      )}
    </>
  );
  const titleMsg =
    platform === 'telegram' && withOkButton ? (
      <ActionsCard actions={[{ type: ACTION.OK, text: okLabel }]}>
        {titleContent}
      </ActionsCard>
    ) : (
      <p>{titleContent}</p>
    );

  const settingsContent = (
    <>
      ‣ 🍅 Time: {settings.workingMins} min
      <br />‣ Short Break: {settings.shortBreakMins} min
      <br />‣ Long Break: {settings.longBreakMins} min
      <br />‣ 🍅 per Day: {settings.pomodoroPerDay}
      <br />‣ Timezone: {settings.timezone >= 0 ? '+' : ''}
      {settings.timezone}
      <br />‣ Clip Language:{' '}
      {settings.clipLanguages.map((code) => clipLanguages[code]).join(', ')}
    </>
  );
  const buttons: ButtonData[] = [];
  if (withEditButton) {
    buttons.push({
      type: 'webview',
      text: 'Edit 📝',
      page: WEBVIEW_PAGE.SETTINGS,
    });
  }
  if (withOkButton) {
    buttons.push({ type: 'action', text: 'Ok 👍', action: ACTION.OK });
  }
  const settingsMsg =
    buttons.length > 0 ? (
      <ButtonsCard buttons={buttons}>{settingsContent}</ButtonsCard>
    ) : (
      <p>{settingsContent}</p>
    );

  return (
    <>
      {titleMsg}
      {settingsMsg}
    </>
  );
};

export default SettingsCard;
