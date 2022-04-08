import React from 'react';
import AppFrame from '../components/AppFrame';
import VtuberMenu from '../components/VtuberMenu';
import Container from '@mui/material/Container';
import UpdateBar from '../components/UpdateBar';
import { PageProps } from '../types';

const SettingsPanel = ({ appData, sendAction, closeWebview }: PageProps) => {
  const oshi = appData?.settings.oshi;
  const currentSubscriptions = appData?.settings.subscriptions;

  const [isUpdating, setUpdating] = React.useState(false);
  const [shouldUpdate, setShouldUpdate] = React.useState(false);
  const [subscriptions, setSubscriptions] = React.useState<Set<string>>(
    () => new Set(currentSubscriptions)
  );

  React.useEffect(() => {
    setSubscriptions(new Set(currentSubscriptions));
    if (isUpdating) {
      setUpdating(false);
      setShouldUpdate(false);
      closeWebview();
    }
  }, [appData]);

  return (
    <AppFrame
      oshi={oshi}
      title="Subscriptions"
      userProfile={appData?.userProfile}
      isProcessing={!appData || isUpdating}
    >
      <Container maxWidth="sm" style={{ padding: 0 }}>
        <VtuberMenu
          oshi={oshi}
          selected={subscriptions}
          selectType="checkbox"
          disabled={isUpdating}
          handleChange={(vtuberId, isSelected) => {
            const nextSubscriptions = new Set(subscriptions);
            if (isSelected) {
              nextSubscriptions.add(vtuberId);
            } else {
              nextSubscriptions.delete(vtuberId);
            }
            setSubscriptions(nextSubscriptions);
            setShouldUpdate(true);
          }}
        />
        <UpdateBar
          disabled={!shouldUpdate}
          handleCancel={() => {
            setSubscriptions(new Set());
          }}
          handleUpdate={() => {
            setUpdating(true);
            sendAction({
              type: 'update_subs',
              payload: { subscriptions: Array.from(subscriptions) },
            });
          }}
        />
      </Container>
    </AppFrame>
  );
};

export default SettingsPanel;
