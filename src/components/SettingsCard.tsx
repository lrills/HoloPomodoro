import Machinat from '@machinat/core';
// @ts-ignore
import clipLanguages from '../../clipLanguages.json';
import { ACTION, WEBVIEW_PATH } from '../constant';
import type { AppSettings } from '../types';
import ButtonsCard, { ButtonData } from './ButtonsCard';

type SettingsCardProps = {
  settings: AppSettings;
  noTitle?: boolean;
  withEditButton?: boolean;
  withOkButton?: boolean;
};

const SettingsCard = ({
  settings,
  noTitle = false,
  withEditButton = false,
  withOkButton = false,
}: SettingsCardProps) => {
  const settingsDesc = `${
    noTitle
      ? ''
      : `⚙️ Settings:
`
  }‣ 🍅 Time:    ${settings.workingMins} min
‣ Short Break: ${settings.shortBreakMins} min
‣ Long Break:  ${settings.longBreakMins} min
‣ 🍅 per Day:  ${settings.pomodoroPerDay}
‣ Timezone:    ${settings.timezone >= 0 ? '+' : ''}${settings.timezone}
‣ Clip Language: ${settings.clipLanguages
    .map((code) => clipLanguages[code])
    .join(', ')}`;

  if (!withEditButton && !withOkButton) {
    return <p>{settingsDesc}</p>;
  }

  const buttons: ButtonData[] = [];
  if (withEditButton) {
    buttons.push({
      type: 'webview',
      text: 'Edit 📝',
      path: WEBVIEW_PATH.SETTINGS,
    });
  }
  if (withOkButton) {
    buttons.push({ type: 'action', text: 'Ok 👍', action: ACTION.OK });
  }

  return (
    <ButtonsCard
      buttons={buttons}
      makeLineAltText={(template) =>
        `${template.text}\n\nTell me "Edit" to change`
      }
    >
      {settingsDesc}
    </ButtonsCard>
  );
};

export default SettingsCard;
