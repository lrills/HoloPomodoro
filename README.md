# HoloPomodoro

This is a fan made [pomodoro timer](https://en.wikipedia.org/wiki/Pomodoro_Technique)
bot. It encourages you as you favorite VTuber and send you a clip while taking a
break.

<video width="320" autoplay="autoplay" loop inline muted>
  <source src="./media/demo.webm" type="video/webm" />
</video>

## Platforms

You can find it on these messaging platforms:

- Telegram: https://telegram.me/HoloPomodoroBot

These platforms are supported but not officially operated yet:

- Messenger (under verification)
- LINE (it's costly)

## Development

### Getting Started

Run the app in development mode:

```sh
$ npm run dev
```

> For the first time using, you have to finish the setup steps listed at
> [Environments Setup](#environments-setup) first.

The command do 2 things:

1. Start a dev server up. It automatically refresh when codes changed.
2. Create a https tunnel connected to a _https://xxx.t.machinat.dev_ endpoint.
   So your local server can accept webhook requests from the chat platforms.

### Environments Setup

#### Configure Chat Platforms

You need to fill the app settings in the `.env` file. Check the `.env.example` 
file for references.

#### Start Dev Server

Try starting the server up with `npm run dev` command. It should succeed if
you fill all the required environments.

#### Initiate App

Keep the dev server runnning, and execute this command in a _new command line
tab_:

```sh
$ npm run migrate
```

This register the webhook bindings and some settings to the chat platforms.
Check `src/migrations/0-init-app.ts` file for the details.

You can run `npm run migrate -- --down` to revert the changes. It's useful if
you edit any settings and need to execute the migration jobs again.

#### Start Developing

Now you can go to the chat platforms and talk to the bot. Check the following
resources to learn how to develop:

- [Machinat Document](https://machinat.com/doc) - guides of Machinat framework.
- [Learn Machinat](https://machinat.com/learn) - a step-by-step tutorial.

## Special Thanks

- All the clip data is fetched from [Holodex](https://holodex.net/) API
