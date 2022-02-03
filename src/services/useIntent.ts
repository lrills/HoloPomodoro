import { makeFactoryProvider } from '@machinat/core';
import DialogFlow from '@machinat/dialogflow';
import decodePostbackData from '../utils/decodePostbackData';
import { ACTION } from '../constant';
import { ChatEventContext, AppEventIntent, AppActionType } from '../types';

const useIntent =
  (recognizer: DialogFlow.Recognizer) =>
  async (event: ChatEventContext['event']): Promise<AppEventIntent> => {
    if (
      event.platform === 'messenger' &&
      event.category === 'message' &&
      event.type === 'image' &&
      event.stickerId === 369239263222822
    ) {
      return { type: ACTION.OK, confidence: 1, payload: null };
    }

    if (event.type === 'text') {
      if (event.text === '👍' || event.text === '👌') {
        return { type: ACTION.OK, confidence: 1, payload: null };
      }

      const { type, confidence, payload } = await recognizer.detectText(
        event.channel,
        event.text
      );
      return {
        type: (type as AppActionType) || ACTION.UNKNOWN,
        confidence,
        payload,
      };
    }

    if (
      (event.platform === 'messenger' &&
        (event.type === 'quick_reply' || event.type === 'postback')) ||
      (event.platform === 'telegram' && event.type === 'callback_query') ||
      (event.platform === 'line' && event.type === 'postback')
    ) {
      if (event.data) {
        const { action, ...payload } = decodePostbackData(event.data);
        return {
          type: action as AppActionType,
          confidence: 1,
          payload,
        };
      }
    }

    return { type: ACTION.UNKNOWN, confidence: 0, payload: null };
  };

export default makeFactoryProvider({
  lifetime: 'scoped',
  deps: [DialogFlow.Recognizer],
})(useIntent);
