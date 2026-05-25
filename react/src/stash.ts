import * as api from './api.ts';
import type { StashEntryInfo } from './types/StashEntryInfo.ts';

function parseStashIndex(stashIdxMsg: string): number {
    return Number(
        stashIdxMsg
            .replace('stash@{', '')
            .replace('}', '')
    );
}

function parseStash(stashMsg: string): StashEntryInfo[] {
    const lines = stashMsg.split('\n');

    const stash: StashEntryInfo[] = [];
    for (let i: number = 0; i < lines.length; i++) {
        if (lines[i] == '') {
            continue;
        }

        const firstColon = stashMsg.indexOf(':');

        const sei: Partial<StashEntryInfo> = {};
        sei.index = parseStashIndex(lines[i].slice(0, firstColon));
        sei.message = lines[i].slice(firstColon + 2);

        stash.push(sei as StashEntryInfo);
    }

    return stash;
}

export async function getStash(): Promise<StashEntryInfo[]> {
    return parseStash(await api.stashList());
}