import Machinat from '@machinat/core';
import { makeContainer } from '@machinat/core/service';
import * as Messenger from '@machinat/messenger/components';
import * as Telegram from '@machinat/telegram/components';
import * as Line from '@machinat/line/components';
import { ServerDomain, LineLiffId } from '../constant';
import getVtuber from '../utils/getVtuber';
import ButtonsCard from './ButtonsCard';

type VtuberCardProps = {
  id: null | string;
  withSelectButton?: boolean;
  withTwitterButton?: boolean;
  withYoutubeButton?: boolean;
};

const VtuberCard =
  (domain: string, liffId: string) =>
  (
    {
      id,
      withSelectButton,
      withTwitterButton,
      withYoutubeButton,
    }: VtuberCardProps,
    { platform }
  ) => {
    const vtuber = getVtuber(id);
    if (!vtuber) {
      return (
        <ButtonsCard
          makeLineAltText={(template) => `${template.text}`}
          buttons={[{ type: 'webview', path: 'oshi', text: 'Select VTuber' }]}
        >
          You haven't select a VTuber. Choose your Oshi here 👇
        </ButtonsCard>
      );
    }

    const { name, englishName, photo, twitter, oshiIcon } = vtuber;
    const twitterUrl = `https://twitter.com/${twitter}`;
    const youtubeUrl = `https://www.youtube.com/channel/${id}`;
    const title = `${name} ${oshiIcon}`;

    if (platform === 'messenger') {
      const ytButton = <Messenger.UrlButton title="YouTube" url={youtubeUrl} />;
      return (
        <Messenger.GenericTemplate imageAspectRatio="square">
          <Messenger.GenericItem
            title={title}
            subtitle={englishName}
            defaultAction={ytButton}
            imageUrl={photo}
            buttons={
              <>
                {withTwitterButton && (
                  <Messenger.UrlButton title="Twitter" url={twitterUrl} />
                )}
                {withYoutubeButton && ytButton}
                {withSelectButton && (
                  <Messenger.UrlButton
                    title="Select VTuber"
                    url={`https://${domain}/webview/oshi?platform=messenger`}
                  />
                )}
              </>
            }
          />
        </Messenger.GenericTemplate>
      );
    }

    if (platform === 'telegram') {
      return (
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
                <Telegram.UrlButton text="Twitter" url={twitterUrl} />
              )}
              {withYoutubeButton && (
                <Telegram.UrlButton text="YouTube" url={youtubeUrl} />
              )}
              {withSelectButton && (
                <Telegram.UrlButton
                  login
                  text="Select VTuber"
                  url={`https://${domain}/auth/telegram?redirectUrl=${encodeURIComponent(
                    `/webview/oshi`
                  )}`}
                />
              )}
            </Telegram.InlineKeyboard>
          }
        />
      );
    }

    if (platform === 'line') {
      const ytAction = <Line.UriAction label="YouTube" uri={youtubeUrl} />;

      return (
        <Line.ButtonTemplate
          altText={`${name} | ${englishName}`}
          title={title}
          thumbnailImageUrl={photo}
          defaultAction={ytAction}
          actions={
            <>
              {ytAction}
              {withTwitterButton && (
                <Line.UriAction label="Twitter" uri={twitterUrl} />
              )}
              {withSelectButton && (
                <Line.UriAction
                  label="Select VTuber"
                  uri={`https://liff.line.me/${liffId}/oshi`}
                />
              )}
            </>
          }
        >
          {englishName}
        </Line.ButtonTemplate>
      );
    }

    return `${name} | ${englishName}
Twitter: ${twitterUrl}
YouTube: ${youtubeUrl}
`;
  };

export default makeContainer({ deps: [ServerDomain, LineLiffId] })(VtuberCard);
