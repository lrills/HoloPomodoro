import React from 'react';
import AppFrame from '../components/AppFrame';
import VtuberMenu from '../components/VtuberMenu';
import Container from '@mui/material/Container';
import UpdateBar from '../components/UpdateBar';
import { PanelPageProps } from '../types';

const SettingsPanel = ({
  appData,
  sendAction,
  closeWebview,
}: PanelPageProps) => {
  const currentOshi = appData?.settings.oshi || null;
  const [isUpdating, setUpdating] = React.useState(false);
  const [selectedOshi, setSelectedOshi] = React.useState<string | null>(
    appData?.settings.oshi || null
  );
  React.useEffect(() => {
    setSelectedOshi(currentOshi);
    if (isUpdating) {
      setUpdating(false);
      closeWebview();
    }
  }, [appData]);

  return (
    <AppFrame
      oshi={currentOshi || selectedOshi}
      title="Favorite VTuber"
      userProfile={appData?.userProfile}
      isProcessing={!appData || isUpdating}
    >
      <Container maxWidth="sm" style={{ padding: 0 }}>
        <VtuberMenu
          oshi={currentOshi}
          selected={new Set(selectedOshi ? [selectedOshi] : [])}
          selectType="radio"
          disabled={isUpdating}
          handleChange={(oshi, isSelected) => {
            setSelectedOshi(isSelected ? oshi : null);
          }}
        />
        <UpdateBar
          disabled={isUpdating || currentOshi === selectedOshi}
          handleCancel={() => {
            setSelectedOshi(currentOshi);
          }}
          handleUpdate={() => {
            setUpdating(true);
            sendAction({
              type: 'update_oshi',
              payload: { oshi: selectedOshi || null },
            });
          }}
        />
      </Container>
    </AppFrame>
  );
};

export default SettingsPanel;
