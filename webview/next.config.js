const { MESSENGER_PAGE_ID, TELEGRAM_BOT_NAME, LINE_LIFF_ID } = process.env;

module.exports = {
  distDir: '../dist',
  basePath: '/webview',
  publicRuntimeConfig: {
    messengerPageId: MESSENGER_PAGE_ID,
    telegramBotName: TELEGRAM_BOT_NAME,
    lineLiffId: LINE_LIFF_ID,
  },
};
