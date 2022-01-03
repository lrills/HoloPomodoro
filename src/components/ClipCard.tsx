import Machinat from '@machinat/core';
import * as Messenger from '@machinat/messenger/components';
import * as Telegram from '@machinat/telegram/components';
import * as Line from '@machinat/line/components';
import encodePostbackData from '../utils/encodePostbackData';
import { ClipData } from '../types';

type ClipCardProps = {
  clip: ClipData;
  withMoreButton?: boolean;
  withYoutubeButton?: boolean;
};

const formatDuration = (duration: number) => {
  const min = (duration / 60).toFixed();
  const sec = duration % 60;
  return `${min}:${sec < 10 ? `0${sec}` : sec}`;
};

const ClipCard = (
  {
    clip: { id, title, duration },
    withYoutubeButton,
    withMoreButton,
  }: ClipCardProps,
  { platform }
) => {
  const youtubeUrl = `https://www.youtube.com/watch?v=${id}`;
  const imageUrl = `https://i.ytimg.com/vi/${id}/sddefault.jpg`;
  const clipDuration = formatDuration(duration);
  const moreActionData = encodePostbackData({ action: 'clip' });
  const youtubeLabel = 'Watch 📺';

  if (platform === 'messenger') {
    const ytButton = (
      <Messenger.UrlButton title={youtubeLabel} url={youtubeUrl} />
    );
    return (
      <Messenger.GenericTemplate imageAspectRatio="horizontal">
        <Messenger.GenericItem
          title={title}
          subtitle={clipDuration}
          defaultAction={ytButton}
          imageUrl={imageUrl}
          buttons={
            <>
              {withYoutubeButton && ytButton}
              {withMoreButton && (
                <Messenger.PostbackButton
                  title="More 📼"
                  payload={moreActionData}
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
        url={imageUrl}
        caption={
          <>
            <b>{title}</b>
            <br />
            <i>{clipDuration}</i>
          </>
        }
        replyMarkup={
          withYoutubeButton || withMoreButton ? (
            <Telegram.InlineKeyboard>
              {withYoutubeButton && (
                <Telegram.UrlButton text={youtubeLabel} url={youtubeUrl} />
              )}
              {withMoreButton && (
                <Telegram.CallbackButton text="More 📼" data={moreActionData} />
              )}
            </Telegram.InlineKeyboard>
          ) : null
        }
      />
    );
  }

  if (platform === 'line') {
    return (
      <Line.ButtonTemplate
        altText={`${title}\n${youtubeUrl}`}
        title={title.length > 40 ? `${title.slice(0, 37)}...` : title}
        thumbnailImageUrl={imageUrl}
        actions={
          <>
            {withYoutubeButton && (
              <Line.UriAction label={youtubeLabel} uri={youtubeUrl} />
            )}
            <Line.PostbackAction label="More 📼" data={moreActionData} />
          </>
        }
      >
        {clipDuration}
      </Line.ButtonTemplate>
    );
  }

  return (
    <>
      {title}
      <br />
      {youtubeUrl}
    </>
  );
};

export default ClipCard;
