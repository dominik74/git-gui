import * as api from './api.ts';
import type { BranchInfo } from './types/BranchInfo.ts';

export async function getBranches(): Promise<BranchInfo[]> {
    const strBranches = (await api.branch()).split('\n');

    const branches: BranchInfo[] = [];
    for (let i: number = 0; i < strBranches.length; i++) {
        const branch: Partial<BranchInfo> = {};
        branch.branchName = strBranches[i].replace('* ', '');
        branch.isCheckedOut = strBranches[i].startsWith('* ');

        branches.push(branch as BranchInfo);
    }

    return branches;
}