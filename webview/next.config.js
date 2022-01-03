module.exports = {
  distDir: '../dist',
  basePath: '/webview',
  publicRuntimeConfig: {
    messengerAppId: process.env.MESSENGER_APP_ID,
    lineLiffId: process.env.LINE_LIFF_ID,
    telegramBotName: process.env.TELEGRAM_BOT_NAME,
  },
};
