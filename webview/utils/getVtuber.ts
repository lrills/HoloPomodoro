// @ts-ignore
import vtubers from '../../vtubers.json';
import { VtuberData } from '../types';

const vtubersMap = new Map(
  (vtubers as VtuberData[]).map((vtuber) => [vtuber.id, vtuber])
);

function getVtubers(id: string): VtuberData;
function getVtubers(id: undefined | null | string): null | VtuberData;
function getVtubers(id: undefined | null | string): null | VtuberData {
  if (!id) {
    return null;
  }
  const vtuber = vtubersMap.get(id);
  return vtuber || null;
}

export default getVtubers;
