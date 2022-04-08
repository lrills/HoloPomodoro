import type {
  WebAppData,
  UpdateSettingsAction,
  UpdateOshiAction,
  UpdateSubscriptionsAction,
} from '../src/types';
export type {
  AppSettings,
  UpdateSettingsAction,
  WebviewAction,
  WebAppData,
  VtuberData,
} from '../src/types';

export type SendWebActionFn = (
  action: Omit<
    UpdateSettingsAction | UpdateOshiAction | UpdateSubscriptionsAction,
    'category'
  >
) => void;

export type PageProps = {
  appData: WebAppData | null;
  sendAction: SendWebActionFn;
  closeWebview: () => boolean;
};
