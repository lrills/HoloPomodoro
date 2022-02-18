# HoloPomodoro

This is a fan made [pomodoro timer](https://en.wikipedia.org/wiki/Pomodoro_Technique)
bot. It encourages you as your Oshi VTuber and send you a clip while taking a
break.

https://user-images.githubusercontent.com/7855890/148721516-efe09b22-56c6-4661-87a9-0bb307267ece.mp4

## Platforms

Try the bot on these chat platforms:

- Messenger (under verification)
- [Telegram](https://t.me/HoloPomodoroBot)

## Getting Started

> You have to finish the [Environments Setup](#environments-setup)
> before start developing.

Run the app in development mode with:

```bash
npm run dev
```

The command does two things:

1. Start a dev server up. It'll refresh automatically when codes changed.
2. Connect a HTTP tunnel to a _https://xxx.t.machinat.dev_ endpoint.
  It's used to receive webhook requests from the chat platforms.

### Environments Setup

#### Chat Platform Settings

You need to configure the platforms and fill the settings in `.env` file.
Check `.env.example` file for guides and usage example.

#### Run Dev Server

Start the server with `npm run dev` command.
It should work if all the required environments are filled at the last step.

#### Initiate Platform Bindings

Keep the dev server runnning and execute this command in a _new command line tab_:

```bash
npm run migrate
```

This register webhooks and other settings on the chat platforms.
If you want to cancel these changes,
use `npm run migrate -- --down` to revert.

#### Start Developing

Now you can go to the chat platforms and try your bot.
Keep the dev server running while developing.
The changes in codes will immediately reflect on the bot.

## Learn More

Here are some resources to learn Machinat framework:

- [Documents](https://machinat.com/doc) - complete guides by topics
- [Tutorial](https://machinat.com/docs/learn) - a step-by-step tutorial to make an app
- [API references](https://machinat.com/api) -  detailed framework API

## Special Thanks

- All the clip data is fetched from [Holodex](https://holodex.net/) API
