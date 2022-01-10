#!/usr/bin/env node
import Machinat from '@machinat/core';
import { FileState } from '@machinat/local-state';
import RedisState from '@machinat/redis-state';
import Messenger from '@machinat/messenger';
import MessengerAssetManager from '@machinat/messenger/asset';
import commander from 'commander';
import changeYoutubeThumbnailSize from '../utils/changeYoutubeThumbnailSize';
import vtubers from '../../vtubers.json';

const { NODE_ENV, MESSENGER_PAGE_ID, MESSENGER_ACCESS_TOKEN, REDIS_URL } =
  process.env as Record<string, string>;
const DEV = NODE_ENV !== 'production';

commander
  .usage('[options]')
  .option('--delete', 'delete all VTuber persona')
  .parse(process.argv);
const options = commander.opts();

async function updateMessengerPersona() {
  const app = Machinat.createApp({
    platforms: [
      Messenger.initModule({
        pageId: Number(MESSENGER_PAGE_ID),
        accessToken: MESSENGER_ACCESS_TOKEN,
        noServer: true,
      }),
    ],
    modules: [
      DEV
        ? FileState.initModule({
            path: './.state_storage',
          })
        : RedisState.initModule({
            clientOptions: {
              url: REDIS_URL,
            },
          }),
    ],
    services: [MessengerAssetManager],
  });
  await app.start();
  const [assetManager] = app.useServices([MessengerAssetManager]);

  if (options.delete) {
    await deletePersonas(assetManager);
  } else {
    await createPersonas(assetManager);
  }

  app.stop();
}

async function createPersonas(assetManager: MessengerAssetManager) {
  console.log(`[persona:update] start updating persona`);
  let updatedCount = 0;

  for (const vtuber of vtubers) {
    const personaId = await assetManager.getPersona(vtuber.id);
    if (!personaId) {
      const personaId = await assetManager.createPersona(vtuber.id, {
        name: vtuber.lang.nickname,
        profile_picture_url: changeYoutubeThumbnailSize(vtuber.photo, 50),
      });
      console.log(
        `[persona:update] persona of ${vtuber.englishName} created: ${personaId}`
      );
      updatedCount += 1;
    }
  }

  console.log(
    `[persona:update] personas are up to date, ${updatedCount} updated`
  );
}

async function deletePersonas(assetManager: MessengerAssetManager) {
  console.log(`[persona:delete] start deleting persona`);
  let deletedCount = 0;

  for (const vtuber of vtubers) {
    const isDeleted = await assetManager.deletePersona(vtuber.id);
    if (isDeleted) {
      console.log(isDeleted);
      console.log(`[persona:delete] persona of ${vtuber.englishName} deleted`);
      deletedCount += 1;
    }
  }

  console.log(`[persona:delete] deleted ${deletedCount} personas`);
}

updateMessengerPersona();
