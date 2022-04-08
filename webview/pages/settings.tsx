import React from 'react';
import Link from 'next/link';
import Container from '@mui/material/Container';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import Checkbox from '@mui/material/Checkbox';
import Button from '@mui/material/Button';
import FormControlLabel from '@mui/material/FormControlLabel';
import clipLanguages from '../../clipLanguages.json';
import AppFrame from '../components/AppFrame';
import NummericSetting from '../components/NummericSetting';
import UpdateBar from '../components/UpdateBar';
import getVtuber from '../utils/getVtuber';
import { AppSettings, PageProps } from '../types';

const displayVtuber = (id?: null | string) => {
  const vtuber = getVtuber(id);
  return vtuber ? `${vtuber.englishName}${vtuber.oshiIcon}` : '';
};

const SettingsPanel = ({ appData, sendAction, closeWebview }: PageProps) => {
  const settings = appData?.settings || null;
  const [settingsInput, setSettingsInput] = React.useState<
    Partial<AppSettings>
  >({});

  const [langOptions, setLangOptions] = React.useState<{
    [k: string]: boolean;
  }>({});
  const resetLangOptions = () => {
    setLangOptions(
      settings?.clipLanguages.reduce(
        (opts, code) => ({ ...opts, [code]: true }),
        {}
      ) || {}
    );
  };

  const shouldUpdate = Object.keys(settingsInput).length > 0;
  const [isUpdating, setUpdating] = React.useState(false);

  React.useEffect(() => {
    if (isUpdating) {
      setUpdating(false);
      setSettingsInput({});
      closeWebview();
    }
    resetLangOptions();
  }, [settings]);

  const handleSettingChange =
    (fieldName: keyof AppSettings) => (value: string | number) => {
      if (value === settings?.[fieldName]) {
        const newSettingsInput = { ...settingsInput };
        delete newSettingsInput[fieldName];
        setSettingsInput(newSettingsInput);
      } else {
        setSettingsInput({ ...settingsInput, [fieldName]: value });
      }
    };

  const displayedSettings = settings ? { ...settings, ...settingsInput } : null;

  return (
    <AppFrame
      title="Settings"
      oshi={settings?.oshi}
      userProfile={appData?.userProfile}
      isProcessing={!settings || isUpdating}
    >
      <Container style={{ padding: 0 }} maxWidth="sm">
        <Paper sx={{ minHeight: '100%' }}>
          <Stack sx={{ padding: '40px 20px' }} spacing={2}>
            <NummericSetting
              fieldId="pomodoro-time"
              fieldName="Pomodoro Time"
              value={displayedSettings?.workingMins || 1}
              disabled={!settings || isUpdating}
              onChange={handleSettingChange('workingMins')}
              min={5}
              max={60}
              step={5}
              unit="min"
            />
            <NummericSetting
              fieldId="short-break-time"
              fieldName="Short Break Time"
              value={displayedSettings?.shortBreakMins || 1}
              disabled={!settings || isUpdating}
              onChange={handleSettingChange('shortBreakMins')}
              min={5}
              max={30}
              step={5}
              unit="min"
            />
            <NummericSetting
              fieldId="long-break-time"
              fieldName="Long Break Time"
              value={displayedSettings?.longBreakMins || 1}
              disabled={!settings || isUpdating}
              onChange={handleSettingChange('longBreakMins')}
              min={5}
              max={60}
              step={5}
              unit="min"
            />
            <NummericSetting
              fieldId="pomodoro-per-day"
              fieldName="Pomodoro Per Day"
              value={displayedSettings?.pomodoroPerDay || 1}
              disabled={!settings || isUpdating}
              onChange={handleSettingChange('pomodoroPerDay')}
              min={1}
              max={30}
              unit={` ${getVtuber(settings?.oshi)?.pomodoroIcon || '🍅'} `}
            />
            <NummericSetting
              fieldId="timezone"
              fieldName="Timezone"
              value={displayedSettings?.timezone || 0}
              disabled={!settings || isUpdating}
              onChange={handleSettingChange('timezone')}
              min={-12}
              max={12}
              unit="UTC"
            />

            <Stack spacing={1}>
              <Typography gutterBottom>Clip Languages</Typography>
              {Object.entries(clipLanguages).map(([code, lang]) => {
                const labelId = `clip-language-${code}`;
                return (
                  <FormControlLabel
                    key={labelId}
                    control={
                      <Checkbox
                        checked={!!langOptions[code]}
                        onChange={(e) => {
                          const newOptions = {
                            ...langOptions,
                            [code]: e.target.checked,
                          };
                          setLangOptions(newOptions);
                          setSettingsInput({
                            ...settingsInput,
                            clipLanguages: Object.entries(newOptions)
                              .filter(([, checked]) => checked)
                              .map(([code]) => code),
                          });
                        }}
                        inputProps={{ 'aria-labelledby': labelId }}
                      />
                    }
                    label={lang}
                  />
                );
              })}
            </Stack>

            <Stack spacing={1}>
              <Typography gutterBottom>Favorite VTuber</Typography>
              <div style={{ paddingLeft: '10px' }}>
                <i>{displayVtuber(settings?.oshi)}</i>
              </div>
              <Link href="/oshi" passHref>
                <Button
                  variant="contained"
                  sx={{ width: '50px' }}
                  component="a"
                >
                  Edit
                </Button>
              </Link>
            </Stack>

            <Stack spacing={1}>
              <Typography gutterBottom>Subscriptions</Typography>
              <div style={{ paddingLeft: '10px' }}>
                <i>
                  {settings?.subscriptions
                    .map((id) => displayVtuber(id))
                    .join(', ')}
                </i>
              </div>
              <Link href={'/subscriptions'} passHref>
                <Button
                  variant="contained"
                  sx={{ width: '50px' }}
                  component="a"
                >
                  Edit
                </Button>
              </Link>
            </Stack>
          </Stack>
          <UpdateBar
            disabled={!shouldUpdate || isUpdating}
            handleCancel={() => {
              setSettingsInput({});
              resetLangOptions();
            }}
            handleUpdate={() => {
              setUpdating(true);
              sendAction({
                type: 'update_settings',
                payload: { settings: settingsInput },
              });
            }}
          />
        </Paper>
      </Container>
    </AppFrame>
  );
};

export default SettingsPanel;
