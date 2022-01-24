#!/usr/bin/env node
import MessengerAssetManager from '@machinat/messenger/asset';
import commander from 'commander';
import createApp from '../app';
import changeYoutubeThumbnailSize from '../utils/changeYoutubeThumbnailSize';
import vtubers from '../../vtubers.json';

commander
  .usage('[options]')
  .option('--delete', 'delete all VTuber persona')
  .parse(process.argv);

const options = commander.opts();
const app = createApp();

async function updateMessengerPersona() {
  await app.start();
  const [assetManager] = app.useServices([MessengerAssetManager]);

  if (options.delete) {
    await deletePersonas(assetManager);
  } else {
    await createPersonas(assetManager);
  }

  app.stop();
}

updateMessengerPersona();

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
