import { gitInteractions } from "./logging";
import type { GitInteraction } from "./types/GitInteraction";

const API_URL = 'http://localhost:8000';

async function runShell(command: string): Promise<string> {
    const resp = await fetch(API_URL, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            command: command
        })
    });

    if (!resp.ok) {
        throw new Error('api error');
    }

    const json = await resp.json();

    return json['output'];
}

async function runGitCommand(gitCommand: string) {
    const gitInteraction: Partial<GitInteraction> = {};
    gitInteraction.command = gitCommand;

    const resp = await runShell(gitInteraction.command);
    gitInteraction.response = resp;

    gitInteractions.unshift(gitInteraction as GitInteraction);

    return gitInteraction.response;
}

export async function status(): Promise<string> {
    return await runGitCommand('git status');
}

export async function stage(filePath: string) {
    await runGitCommand('git add "' + filePath + '"');
}

export async function unstage(filePath: string) {
    await runGitCommand('git restore --staged "' + filePath + '"');
}

export async function stageAll() {
    await runGitCommand('git add .');
}

export async function unstageAll() {
    await runGitCommand('git restore --staged .');
}

export async function commit(message: string) {
    await runGitCommand('git commit -m "' + message + '"');
}

export async function stash() {
    await runGitCommand('git stash -u');
}

export async function stashStaged() {
    await runGitCommand('git stash --staged');
}

export async function stashApply(idx: number) {
    await runGitCommand('git stash apply stash@{' + idx + '}');
}

export async function stashList() {
    return await runGitCommand('git stash list');
}

export async function logOneline() {
    return await runGitCommand('git log --oneline');
}

export async function checkout(branchNameOrHash: string) {
    await runGitCommand('git checkout ' + branchNameOrHash);
}

export async function branch(branchName?: string) {
    if (branchName !== undefined) {
        return await runGitCommand('git branch ' + branchName);
    } else {
        return await runGitCommand('git branch');
    }
}

export async function discard(filePath: string) {
    await runGitCommand('git restore "' + filePath + '"');
}