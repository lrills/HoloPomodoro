import { makeClassProvider } from '@machinat/core/service';
import StateController from '@machinat/core/base/StateController';
import BaseBot from '@machinat/core/base/Bot';
import Script from '@machinat/script';
import type { MessengerChat } from '@machinat/messenger';
import type { TelegramChat } from '@machinat/telegram';
import type { LineChat } from '@machinat/line';

type TimerData = {
  channel: MessengerChat | TelegramChat | LineChat;
};

type TimeUpListener = (timeUpTargets: TimerData[]) => void;

const getDueTimeInterval = (dueDate: Date) =>
  Math.ceil(dueDate.getTime() / 10000);

const getIntervalId = (i) => `timer:${i.toString()}`;

export class Timer {
  stateController: StateController;
  private _intervalId: null | NodeJS.Timeout;
  private _listeners: TimeUpListener[];
  private _currentInterval: number;

  constructor(stateController: StateController) {
    this.stateController = stateController;
    this._listeners = [];
  }

  start(): void {
    this._intervalId = setInterval(this._handleTimesUp.bind(this), 5000);
  }

  stop(): void {
    if (this._intervalId) {
      clearInterval(this._intervalId);
      this._intervalId = null;
    }
  }

  async registerTimer(
    channel: MessengerChat | TelegramChat | LineChat,
    dueDate: Date
  ): Promise<void> {
    const interval = getDueTimeInterval(dueDate);
    if (this._currentInterval >= interval) {
      return;
    }

    await this.stateController
      .globalState(getIntervalId(interval))
      .set<TimerData>(channel.uid, { channel });
  }

  async cancelTimer(
    channel: MessengerChat | TelegramChat | LineChat,
    dueDate: Date
  ): Promise<boolean> {
    const interval = getDueTimeInterval(dueDate);
    if (this._currentInterval >= interval) {
      return false;
    }

    const isDeleted = await this.stateController
      .globalState(getIntervalId(interval))
      .delete(channel.uid);
    return isDeleted;
  }

  onTimesUp(listener: TimeUpListener): void {
    this._listeners.push(listener);
  }

  private async _handleTimesUp() {
    const interval = Math.floor(Date.now() / 10000);
    if (this._currentInterval >= interval) {
      return;
    }
    this._currentInterval = interval;

    const minuteState = this.stateController.globalState(
      getIntervalId(interval)
    );

    const timingChats = await minuteState.getAll<TimerData>();
    if (timingChats.size === 0) {
      return;
    }

    const targets = [...timingChats.values()];
    for (const listener of this._listeners) {
      listener(targets);
    }

    await minuteState.clear();
  }
}

export default makeClassProvider({
  lifetime: 'singleton',
  deps: [StateController, Script.Processor, BaseBot],
})(Timer);
