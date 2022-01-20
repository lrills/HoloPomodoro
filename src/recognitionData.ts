import { RecognitionData } from '@machinat/core/base/IntentRecognizer';

const recognitionData: RecognitionData<'en'> = {
  defaultLanguage: 'en',
  languages: ['en'],
  intents: {
    about: {
      trainingPhrases: {
        en: [
          'what',
          "what's this?",
          'what the heck',
          'how can you help me?',
          'who are you?',
          'what can you do?',
          'about',
        ],
      },
    },

    no: {
      trainingPhrases: {
        en: [
          'no',
          'nope',
          'sorry',
          'not this time',
          'maybe next time',
          'no, thanks',
        ],
      },
    },

    ok: {
      trainingPhrases: {
        en: [
          'yes',
          'ok',
          'ya',
          'nice',
          'good',
          'cool',
          'fine',
          "I'd like to",
          'I love to',
        ],
      },
    },

    pause: {
      trainingPhrases: {
        en: [
          'pause',
          'stop',
          'wait a second',
          'wait a minute',
          'freeze',
          'hold up',
        ],
      },
    },

    settings: {
      trainingPhrases: {
        en: [
          'set up',
          'config',
          'settings',
          'my config',
          'my settings',
          'change settings',
          'edit settings',
          'check setting',
          'show settings',
        ],
      },
    },

    skip: {
      trainingPhrases: {
        en: ['times up', 'skip', 'cancel'],
      },
    },

    reset: {
      trainingPhrases: {
        en: [
          'recount pomodoro',
          'reset ',
          'recount',
          'reset pomodoro',
          'reset',
        ],
      },
    },

    start: {
      trainingPhrases: {
        en: [
          'go',
          'start',
          'begin',
          'keep on',
          'move on',
          "let's begin",
          "let's go",
          'start timing',
        ],
      },
    },

    statistics: {
      trainingPhrases: {
        en: [
          'data',
          'records',
          'history',
          'statistics',
          'check data',
          'show records',
          'my history',
          'see statistics',
        ],
      },
    },

    clip: {
      trainingPhrases: {
        en: [
          'youtube',
          'videos',
          'give me more',
          'more clips',
          'clips',
          'highlight',
          'send me clips',
          'send me highlights',
          'give me clips',
          'get clips',
        ],
      },
    },

    subscriptions: {
      trainingPhrases: {
        en: [
          'add subscriptions',
          'sub',
          'subscriptions',
          'my vtuber subscriptions',
          'subscribe vtubers',
          'see subscriptions',
          'check subscriptions',
          'subscribe',
        ],
      },
    },
  },
};

export default recognitionData;
