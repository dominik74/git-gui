import type { CommitInfo } from "./types/CommitInfo";
import * as api from './api.ts';

function parseOnelineLogLine(onelineLogLine: string): CommitInfo {
    const firstSpace = onelineLogLine.indexOf(' ');

    const parts = [
        onelineLogLine.slice(0, firstSpace),
        onelineLogLine.slice(firstSpace),
    ];


    const ci: Partial<CommitInfo> = {};
    ci.hash = parts[0];
    ci.message = parts[1];

    return ci as CommitInfo;
}

function parseOnelineLog(onelineLog: string): CommitInfo[] {
    const logLines = onelineLog.split('\n');

    const commitInfos: CommitInfo[] = [];
    for (let i: number = 0; i < logLines.length; i++) {
        commitInfos.push(parseOnelineLogLine(logLines[i]));
    }

    return commitInfos;
}

export async function getCommits(): Promise<CommitInfo[]> {
    return parseOnelineLog(await api.logOneline());
}