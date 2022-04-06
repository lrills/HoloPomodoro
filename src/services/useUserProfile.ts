import {
  makeFactoryProvider,
  StateController,
  BasicProfiler,
  MachinatProfile,
} from '@machinat/core';
import { STATE_KEY } from '../constant';
import { AppUser } from '../types';

const useUserProfile =
  (profiler: BasicProfiler, controller: StateController) =>
  async (user: AppUser): Promise<null | MachinatProfile> => {
    const userState = controller.userState(user);
    const cachedProfile = await userState.get<MachinatProfile>(
      STATE_KEY.PROFILE
    );
    if (
      cachedProfile &&
      (user.platform !== 'telegram' || cachedProfile.avatarUrl)
    ) {
      return cachedProfile;
    }

    let profile: null | MachinatProfile = null;
    try {
      profile = await profiler.getUserProfile(user);
    } catch {}

    if (profile) {
      await userState.set<MachinatProfile>(STATE_KEY.PROFILE, profile);
    }

    return profile;
  };

export default makeFactoryProvider({
  lifetime: 'scoped',
  deps: [BasicProfiler, StateController],
})(useUserProfile);
