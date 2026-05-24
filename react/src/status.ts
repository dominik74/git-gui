import * as api from './api.ts';
import { FileState, type FileInfo } from './types/FileInfo.ts';
import type { StatusInfo } from './types/StatusInfo.ts';

const META_STATUS_LINES = [
    '',
    'Changes to be committed:',
    '(use "git restore --staged <file>..." to unstage)',
    'Untracked files:',
    '(use "git add <file>..." to update what will be committed)',
    '(use "git add <file>..." to include in what will be committed)',
    '(use "git restore <file>..." to discard changes in working directory)',
    'no changes added to commit (use "git add" and/or "git commit -a")',
    'nothing added to commit but untracked files present (use "git add" to track)',
    'nothing to commit, working tree clean',
];

function parseFileState(fileState: string): FileState {
    if (fileState === 'modified:') {
        return FileState.modified;
    } else {
        return FileState.untracked;
    }
}

function parseStatusLine(statusLine: string): FileInfo {
    const pieces = statusLine.trim().split('   ');

    let fi: Partial<FileInfo> = {};

    if (pieces.length > 1) {
        fi.state = parseFileState(pieces[0]);
        fi.path = pieces[1];
    } else {
        fi.state = FileState.untracked;
        fi.path = statusLine.trim();
    }

    return fi as FileInfo;
}

function parseStatusMsg(statusMsg: string): StatusInfo {
    const statusLines = statusMsg.split('\n');

    const currentBranch = statusLines[0].replace('On branch ', '');

    const fileInfos: FileInfo[] = [];
    let readingStaged = false;
    for (let i: number = 1; i < statusLines.length; i++) {
        if (statusLines[i].trim() === 'Changes not staged for commit:') {
            readingStaged = false;
        } else if (statusLines[i].trim() === 'Untracked files:') {
            readingStaged = false;
        } else if (statusLines[i].trim() === 'Changes to be committed:') {
            readingStaged = true;
        } else {
            if (!META_STATUS_LINES.includes(statusLines[i].trim())) {
                const fi = parseStatusLine(statusLines[i]);
                fi.isStaged = readingStaged;

                fileInfos.push(fi);
            }
        }
    }

    const statusInfo: StatusInfo = {
        currentBranch: currentBranch,
        fileInfos: fileInfos,
    };

    return statusInfo;
}

export async function getStatusInfo(): Promise<StatusInfo> {
    return parseStatusMsg(await api.status());
}
