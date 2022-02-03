import {
  makeClassProvider,
  makeInterface,
  StateController,
} from '@machinat/core';
import fetch from 'node-fetch';
import getVtuber from '../utils/getVtuber';
import vtubers from '../../vtubers.json';
import { ClipData } from '../types';

const CLIPS_CACHE_KEY = 'clips_cache_by_hour';
const anHour = 3600000;

const hourId = (date: Date) => date.toISOString().slice(0, 13);
const dateFromHourId = (hour: string) => new Date(`${hour}:00Z`);
const hourBeginning = (date?: Date | number) => {
  const beginning = date ? new Date(date) : new Date();
  beginning.setMinutes(0, 0, 0);
  return beginning;
};

const searchClipIdxBeforeTime = (clips: ClipData[], time: Date) => {
  let start = 0;
  let end = clips.length;
  while (end !== start) {
    const idx = Math.floor((start + end) / 2);
    const clipTime = new Date(clips[idx].availableAt);
    if (clipTime >= time) {
      start = idx + 1;
    } else {
      end = idx;
    }
  }
  return end === clips.length ? -1 : end;
};

const random = (items: string[]): [string, string[]] => {
  if (items.length === 0) {
    return ['', []];
  }
  const idx = Math.floor(Math.random() * items.length);
  return [items[idx], [...items.slice(0, idx), ...items.slice(idx + 1)]];
};

const clipFromRawData = (data): ClipData => ({
  id: data.id,
  title: data.title,
  availableAt: Date.parse(data.available_at),
  duration: data.duration,
  lang: data.lang,
  channelId: data.channel.id,
  sources:
    data.sources?.reduce((vtubers, source) => {
      const vtuberId = source.channel.id;
      return vtubers.includes(vtuberId) ? vtubers : [...vtubers, vtuberId];
    }, []) || [],
  mentions:
    data.mentions?.reduce((vtubers, channel) => [...vtubers, channel.id], []) ||
    [],
});

export type ClipsManagerOptions = {
  clipsAvailableHours: number;
  refreshLastestHours: number;
  holodexApiKey: string;
};

export const ClipsManagerOptions = makeInterface<ClipsManagerOptions>({
  name: 'ClipsManagerOptions',
});

type GetClipsOptions = {
  languages: string[];
  vtubers: string[];
  excludes: string[];
  durationLimit?: number;
};

class ClipsManager {
  stateController: StateController;
  clipsAvailableHours: number;
  holodexApiKey: string;
  refreshLastestHours: number;

  private _clips: ClipData[];
  private _vtuberIndexes: Map<string, ClipData[]>;
  private _updateInterval: null | NodeJS.Timeout;

  constructor(
    stateController: StateController,
    {
      clipsAvailableHours,
      holodexApiKey,
      refreshLastestHours,
    }: ClipsManagerOptions
  ) {
    this.stateController = stateController;
    this.clipsAvailableHours = clipsAvailableHours;
    this.holodexApiKey = holodexApiKey;
    this.refreshLastestHours = refreshLastestHours;

    this._clips = [];
    this._vtuberIndexes = new Map(vtubers.map((vtuber) => [vtuber.id, []]));
  }

  async refresh() {
    this.stop();
    await this._loadClipsFromCache();
    await this._cleanOldClips();
    await this._updateNewClips();
    this._updateVtubersIndexes(this._clips);
    this._updateInterval = setInterval(this._updateCallback, anHour);
  }

  private _updateCallback = this.update.bind(this);
  async update() {
    await this._cleanOldClips();
    const newClips = await this._updateNewClips();
    this._updateVtubersIndexes(newClips);
  }

  async stop() {
    if (this._updateInterval) {
      clearInterval(this._updateInterval);
      this._updateInterval = null;
    }
  }

  getClip(options: GetClipsOptions) {
    return (
      this._getClipOfType('sources', options) ||
      this._getClipOfType('mentions', options)
    );
  }

  private _getClipOfType(
    type: 'sources' | 'mentions',
    { vtubers, languages, durationLimit, excludes }: GetClipsOptions
  ) {
    const vtubersToSearch = new Set(vtubers);
    let clip: null | ClipData = null;
    let vtuber = '';
    let rest: string[] = [];
    let searchEnd = new Date();
    let searchStart = new Date();

    while (clip === null && vtubersToSearch.size > 0) {
      if (rest.length === 0) {
        [vtuber, rest] = random([...vtubersToSearch]);
        searchStart = searchEnd;
        searchEnd = new Date(searchStart.getTime() - 86400000); // a day ago
      } else {
        [vtuber, rest] = random(rest);
      }

      const index = this._vtuberIndexes.get(vtuber);
      const start = index ? searchClipIdxBeforeTime(index, searchStart) : -1;

      if (index && start !== -1) {
        for (let i = start; i < index.length; i += 1) {
          const curClip = index[i];

          if (curClip.availableAt < searchEnd.getTime()) {
            break;
          }
          if (
            !excludes.includes(curClip.id) &&
            languages.includes(curClip.lang) &&
            (!durationLimit || curClip.duration <= durationLimit) &&
            curClip[type].includes(vtuber)
          ) {
            clip = curClip;
            break;
          }
        }
      } else {
        vtubersToSearch.delete(vtuber);
      }
    }
    return clip;
  }

  private async _loadClipsFromCache() {
    console.log(`[clips:load] start loading clips from cache`);

    const clipsCache = this.stateController.globalState(CLIPS_CACHE_KEY);
    const cachedHours = await clipsCache.keys();
    const sortedHours = cachedHours.sort().reverse();

    const clipsOfHours = await Promise.all(
      sortedHours.map((hour) => clipsCache.get<ClipData>(hour))
    );
    this._clips = clipsOfHours
      .filter((clips): clips is ClipData => !!clips)
      .flat(1);

    console.log(`[clips:load] finish loading ${this._clips.length} clips`);
  }

  private async _cleanOldClips() {
    const expiry = hourBeginning(
      Date.now() - this.clipsAvailableHours * anHour
    );

    console.log(
      `[clips:clean] start cleaning clips before ${expiry.toISOString()}`
    );

    const expiryIdx = searchClipIdxBeforeTime(this._clips, expiry);
    if (expiryIdx !== -1) {
      this._clips.splice(expiryIdx);
    }

    for (const [, index] of this._vtuberIndexes) {
      const i = searchClipIdxBeforeTime(index, expiry);
      index.splice(i);
    }

    const clipsCache = this.stateController.globalState(CLIPS_CACHE_KEY);
    const cachedHours = await clipsCache.keys();
    await Promise.all(
      cachedHours.map((hour) => {
        if (dateFromHourId(hour) >= expiry) {
          return null;
        }
        console.log(`[clips:clean] expire clips on ${hour}`);
        return clipsCache.delete(hour);
      })
    );

    console.log(
      `[clips:clean] finish cleaning ${Math.max(0, expiryIdx)} clips`
    );
  }

  private async _updateNewClips(): Promise<ClipData[]> {
    const clipsCache = this.stateController.globalState(CLIPS_CACHE_KEY);
    const currentHour = hourBeginning();

    const currentHourCached = await clipsCache.get(hourId(currentHour));
    if (currentHourCached) {
      console.log(
        `[clips:update] clips cache is already up to date; ${this._clips.length} clips available`
      );
      return [];
    }
    console.log(`[clips:update] start updating clips`);

    let pointer = new Date(currentHour);
    const cacheLimit = new Date(
      currentHour.getTime() - this.clipsAvailableHours * anHour
    );
    const refreshLimit = new Date(
      (this._clips[0]?.availableAt || 0) - this.refreshLastestHours * anHour
    );

    const cachingPromises: Promise<unknown>[] = [];
    const fetchedClips: ClipData[] = [];
    let clipsInHour: ClipData[] = [];

    try {
      let offset = 0;
      while (pointer > refreshLimit && pointer >= cacheLimit) {
        const rawClipsData = await this._fetchClips(offset);
        offset += 50;
        (rawClipsData as any[]).forEach((data) => {
          if (pointer < cacheLimit) {
            return;
          }

          const clipAvailableTime = new Date(data.available_at);
          if (clipAvailableTime < pointer) {
            const hour = hourId(pointer);
            console.log(
              `[clips:update] update ${clipsInHour.length} clips on ${hour}`
            );

            cachingPromises.push(clipsCache.set(hour, clipsInHour));
            fetchedClips.push(...clipsInHour);

            clipsInHour = [];
            pointer = hourBeginning(clipAvailableTime);
          }

          clipsInHour.push(clipFromRawData(data));
        });
      }
    } catch (e) {
      console.log(`[clips:update] API error: ${e.message}`);
    }

    const refreshTillIdx = searchClipIdxBeforeTime(
      this._clips,
      new Date(fetchedClips[fetchedClips.length - 1]?.availableAt || Date.now())
    );
    this._clips.splice(0, refreshTillIdx, ...fetchedClips);

    await Promise.all(cachingPromises);
    console.log(
      `[clips:update] finish updating clips: ${this._clips.length} clips available; ${fetchedClips.length} newly fetched`
    );

    return fetchedClips;
  }

  private _updateVtubersIndexes(clips: ClipData[]) {
    console.log(`[clips:index] start updating clips-of-vtubers indexes`);
    const updateTill = new Date(
      clips[clips.length - 1]?.availableAt || Date.now()
    );

    for (const [vtuberId, index] of this._vtuberIndexes) {
      const vtuberRelatedClips = clips.filter(
        (clip) =>
          clip.sources.includes(vtuberId) || clip.mentions.includes(vtuberId)
      );
      const i = searchClipIdxBeforeTime(index, updateTill);
      index.splice(0, i, ...vtuberRelatedClips);
      console.log(
        `[clips:index] ${getVtuber(vtuberId).englishName}: ${
          index.length
        } clips`
      );
    }
    console.log(`[clips:index] finish updating indexes`);
  }

  private async _fetchClips(offset: number): Promise<any[]> {
    const res = await fetch(
      `https://holodex.net/api/v2/videos?limit=50&offset=${offset}&status=past&type=clip&include=sources,mentions&org=Hololive`,
      { headers: { 'X-APIKEY': this.holodexApiKey } }
    );
    const data = await res.json();
    return data;
  }
}

export default makeClassProvider({
  deps: [StateController, ClipsManagerOptions],
  lifetime: 'singleton',
})(ClipsManager);
