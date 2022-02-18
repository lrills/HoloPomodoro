#!/usr/bin/env node
import { resolve as resolvePath } from 'path';
import DialogFlow from '@machinat/dialogflow';
import { Umzug, JSONStorage } from 'umzug';
import commander from 'commander';
import createApp from '../app';

const app = createApp({ noServer: true });

const umzug = new Umzug({
  storage: new JSONStorage({
    path: resolvePath('./.executed_migrations.json'),
  }),
  logger: console,
  migrations: {
    glob: resolvePath(
      __dirname,
      `../migrations/*.${__dirname.includes('/src/') ? 'ts' : 'js'}`
    ),
    resolve: ({ name, path }) => {
      return {
        name: name.replace(/.[t|j]s$/, ''),
        up: async () => {
          const { up } = await import(path as string);
          if (up) {
            const scope = app.serviceSpace.createScope();
            await scope.injectContainer(up);
          }
        },
        down: async () => {
          const { down } = await import(path as string);
          if (down) {
            const scope = app.serviceSpace.createScope();
            await scope.injectContainer(down);
          }
        },
      };
    },
  },
});

commander
  .usage('[options]')
  .option('--down', 'roll back down')
  .parse(process.argv);

const options = commander.opts();

async function migrate() {
  await app.start();

  if (options.down) {
    await umzug.down();
  } else {
    await umzug.up();
  }

  const [dialogFlowRecognizer] = app.useServices([DialogFlow.Recognizer]);

  console.log('[dialogflow:train] start updating dialogflow');
  const isUpdated = await dialogFlowRecognizer.train();
  console.log(
    `[dialogflow:train] ${
      isUpdated ? 'new agent version is created' : 'agent version is up to date'
    }`
  );

  await app.stop();
}

migrate().catch((err) => {
  console.error(err);
  process.exit(1);
});
