import Machinat from '@machinat/core';
import * as Messenger from '@machinat/messenger/components';
import { WebviewButton as MessengerWebviewButton } from '@machinat/messenger/webview';
import * as Telegram from '@machinat/telegram/components';
import { WebviewButton as TelegramWebviewButton } from '@machinat/telegram/webview';
import * as Line from '@machinat/line/components';
import { WebviewAction as LineWebviewAction } from '@machinat/line/webview';
import { ACTION, WEBVIEW_PAGE } from '../constant';
import getVtuber from '../utils/getVtuber';
import encodePostbackData from '../utils/encodePostbackData';
import ButtonsCard from './ButtonsCard';
import Pause from './Pause';

type VtuberCardProps = {
  id: null | string;
  withOkButton?: boolean;
  withTwitterButton?: boolean;
  withYoutubeButton?: boolean;
};

const VtuberCard = (
  { id, withOkButton, withTwitterButton, withYoutubeButton }: VtuberCardProps,
  { platform }
) => {
  const vtuber = getVtuber(id);
  if (!vtuber) {
    return (
      <ButtonsCard
        buttons={[
          { type: 'webview', page: WEBVIEW_PAGE.OSHI, text: 'Select VTuber' },
        ]}
      >
        You haven't select a VTuber. Choose your Oshi here 👇
      </ButtonsCard>
    );
  }

  const { name, englishName, photo, twitter, oshiIcon } = vtuber;
  const twitterLabel = 'Twitter 🐦';
  const twitterUrl = `https://twitter.com/${twitter}`;
  const youtubeLabel = 'YouTube 📺';
  const youtubeUrl = `https://www.youtube.com/channel/${id}`;
  const selectVtuberLabel = 'Select VTuber 🙋';
  const okLabel = 'Go 👍';
  const okData = encodePostbackData({ action: ACTION.OK });
  const title = `${name} ${oshiIcon}`;

  if (platform === 'messenger') {
    const ytButton = (
      <Messenger.UrlButton title={youtubeLabel} url={youtubeUrl} />
    );
    return (
      <>
        <p>{vtuber.lang.greeting}</p>
        <Pause time={500} />
        <p>{vtuber.lang.introduction}</p>
        <Pause time={500} />
        <Messenger.GenericTemplate imageAspectRatio="square">
          <Messenger.GenericItem
            title={title}
            subtitle={englishName}
            defaultAction={ytButton}
            imageUrl={photo}
            buttons={
              <>
                {withTwitterButton && (
                  <Messenger.UrlButton title={twitterLabel} url={twitterUrl} />
                )}
                {withYoutubeButton && ytButton}
                <MessengerWebviewButton
                  hideShareButton
                  title={selectVtuberLabel}
                  page={WEBVIEW_PAGE.OSHI}
                />
                {withOkButton && (
                  <Messenger.PostbackButton title={okLabel} payload={okData} />
                )}
              </>
            }
          />
        </Messenger.GenericTemplate>
      </>
    );
  }

  if (platform === 'telegram') {
    return (
      <>
        <p>{vtuber.lang.greeting}</p>
        <Pause time={500} />
        <Telegram.Text
          replyMarkup={
            withOkButton && (
              <Telegram.ReplyKeyboard resizeKeyboard>
                <Telegram.TextReply text={okLabel} />
              </Telegram.ReplyKeyboard>
            )
          }
        >
          {vtuber.lang.introduction}
        </Telegram.Text>
        <Pause time={2000} />
        <Telegram.Photo
          url={photo}
          caption={
            <>
              <b>
                <i>{title}</i>
              </b>
              <br />
              <i>{englishName}</i>
            </>
          }
          replyMarkup={
            <Telegram.InlineKeyboard>
              {withTwitterButton && (
                <Telegram.UrlButton text={twitterLabel} url={twitterUrl} />
              )}
              {withYoutubeButton && (
                <Telegram.UrlButton text={youtubeLabel} url={youtubeUrl} />
              )}
              <TelegramWebviewButton
                text={selectVtuberLabel}
                page={WEBVIEW_PAGE.OSHI}
              />
              {withOkButton && (
                <Telegram.CallbackButton text={okLabel} data={okData} />
              )}
            </Telegram.InlineKeyboard>
          }
        />
      </>
    );
  }

  if (platform === 'line') {
    const ytAction = <Line.UriAction label={youtubeLabel} uri={youtubeUrl} />;
    return (
      <>
        <p>{vtuber.lang.greeting}</p>
        <Pause time={500} />
        <p>{vtuber.lang.introduction}</p>
        <Pause time={500} />
        <Line.ButtonTemplate
          altText={`${name} | ${englishName}`}
          title={title}
          thumbnailImageUrl={photo}
          defaultAction={ytAction}
          actions={
            <>
              {withYoutubeButton && ytAction}
              {withTwitterButton && (
                <Line.UriAction label={twitterLabel} uri={twitterUrl} />
              )}
              <LineWebviewAction
                label={selectVtuberLabel}
                page={WEBVIEW_PAGE.OSHI}
              />
              {withOkButton && (
                <Line.PostbackAction
                  label={okLabel}
                  displayText={okLabel}
                  data={okData}
                />
              )}
            </>
          }
        >
          {englishName}
        </Line.ButtonTemplate>
      </>
    );
  }

  return (
    <p>
      {name} | {englishName}
      <br />
      Twitter: {twitterUrl}
      <br />
      YouTube: {youtubeUrl}
    </p>
  );
};

export default VtuberCard;
