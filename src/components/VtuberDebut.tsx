import Machinat from '@machinat/core';
import { makeContainer } from '@machinat/core/service';
import * as Messenger from '@machinat/messenger/components';
import * as Telegram from '@machinat/telegram/components';
import * as Line from '@machinat/line/components';
import { ACTION, ServerDomain, LineLiffId } from '../constant';
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

const VtuberCard =
  (domain: string, liffId: string) =>
  (
    { id, withOkButton, withTwitterButton, withYoutubeButton }: VtuberCardProps,
    { platform }
  ) => {
    const vtuber = getVtuber(id);
    if (!vtuber) {
      return (
        <ButtonsCard
          buttons={[{ type: 'webview', path: 'oshi', text: 'Select VTuber' }]}
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
    const okLabel = 'Ok 👍';
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
                    <Messenger.UrlButton
                      title={twitterLabel}
                      url={twitterUrl}
                    />
                  )}
                  {withYoutubeButton && ytButton}
                  <Messenger.UrlButton
                    hideWebviewShare
                    messengerExtensions
                    title={selectVtuberLabel}
                    url={`https://${domain}/webview/oshi?platform=messenger`}
                  />
                  {withOkButton && (
                    <Messenger.PostbackButton
                      title={okLabel}
                      payload={okData}
                    />
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
                <Telegram.UrlButton
                  login
                  text={selectVtuberLabel}
                  url={`https://${domain}/auth/telegram?redirectUrl=${encodeURIComponent(
                    `/webview/oshi`
                  )}`}
                />
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
                <Line.UriAction
                  label={selectVtuberLabel}
                  uri={`https://liff.line.me/${liffId}/oshi`}
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

    return `${name} | ${englishName}
Twitter: ${twitterUrl}
YouTube: ${youtubeUrl}
`;
  };

export default makeContainer({ deps: [ServerDomain, LineLiffId] })(VtuberCard);
