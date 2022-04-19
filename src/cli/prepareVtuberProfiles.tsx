#!/usr/bin/env node
import Machinat from '@machinat/core';
import MessengerAssetManager from '@machinat/messenger/asset';
import TwitterAssetManager from '@machinat/twitter/asset';
import * as Twitter from '@machinat/twitter/components';
import commander from 'commander';
import createApp from '../app';
import changeYoutubeThumbnailSize from '../utils/changeYoutubeThumbnailSize';
import vtubers from '../../vtubers.json';

commander
  .usage('[options]')
  .option('--clear', 'clear all VTuber persona')
  .parse(process.argv);

const options = commander.opts();
const app = createApp({ noServer: true });

async function prepareVtuberProfiles() {
  await app.start();
  const [messengerAssetManager, twitterAssetManager] = app.useServices([
    MessengerAssetManager,
    TwitterAssetManager,
  ]);

  if (options.clear) {
    await clearProfiles(messengerAssetManager, twitterAssetManager);
  } else {
    await createProfiles(messengerAssetManager, twitterAssetManager);
  }

  app.stop();
}

prepareVtuberProfiles();

async function createProfiles(
  messengerAssetManager: MessengerAssetManager,
  twitterAssetManager: TwitterAssetManager
) {
  console.log(`[profile:update] start updating vtuber profiles`);

  for (const vtuber of vtubers) {
    const shortName = vtuber.lang.nickname;
    const photoTag = `photo-${vtuber.id}`;
    const iconTag = `icon-${vtuber.id}`;
    const iconUrl = changeYoutubeThumbnailSize(vtuber.photo, 50);

    // update Messenger persona
    const personaId = await messengerAssetManager.getPersona(iconTag);
    if (!personaId) {
      const personaId = await messengerAssetManager.createPersona(iconTag, {
        name: shortName,
        profile_picture_url: iconUrl,
      });
      console.log(
        `[profile:messenger] persona of ${vtuber.englishName} is created: ${personaId}`
      );
    }

    let photoMediaId = await twitterAssetManager.getMedia(photoTag);
    if (!photoMediaId) {
      ({ id: photoMediaId } = await twitterAssetManager.renderMedia(
        photoTag,
        <Twitter.Photo shared url={vtuber.photo} />
      ));
      console.log(
        `[profile:twitter] photo of ${vtuber.englishName} is uploaded: ${photoMediaId}`
      );
    }

    // NOTE: API not available
    // update Twitter custom profile
    // const customProfileId = await twitterAssetManager.getCustomProfile(
    //   iconTag
    // );
    // if (!customProfileId) {
    //   const [{ id: mediaId }] = await twitterBot.renderMedia(
    //     <Twitter.Photo url={iconUrl} />
    //   );
    //
    //   const customProfileId = await twitterAssetManager.createCustomProfile(
    //     iconTag,
    //     shortName,
    //     mediaId
    //   );
    //   console.log(
    //     `[profile:twitter] custom profile of ${vtuber.englishName} is created: ${customProfileId}`
    //   );
    // }
  }
}

async function clearProfiles(
  messengerAssetManager: MessengerAssetManager,
  twitterAssetManager: TwitterAssetManager
) {
  console.log(`[profile:clear] start clearing vtuber profiles`);

  for (const vtuber of vtubers) {
    const photoTag = `photo-${vtuber.id}`;
    const iconTag = `icon-${vtuber.id}`;

    // delete Messenger persona
    if (await messengerAssetManager.deletePersona(iconTag)) {
      console.log(
        `[profile:messenger] persona of ${vtuber.englishName} is deleted`
      );
    }

    if (await twitterAssetManager.unsaveMedia(photoTag)) {
      console.log(
        `[profile:twitter] photo of ${vtuber.englishName} is deleted`
      );
    }

    // NOTE: API not available
    // delete Twitter custom profile
    // const customProfileId = await twitterAssetManager.deleteCustomProfile(iconTag);
    // if (customProfileId) {
    //   console.log(`[profile:twitter] custom profile of ${vtuber.englishName} deleted`);
    //   deletedCount += 1;
    // }
  }

  console.log(`[profile:clear] profile assets are cleared`);
}
