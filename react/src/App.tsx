import { useEffect, useState } from 'react'
import * as api from './api.ts';
import * as status from './status.ts';
import * as logging from './logging.ts';
import * as log from './log.ts';
import * as stashParsing from './stash.ts';
import * as branch from './branch.ts';
import type { FileInfo } from './types/FileInfo.ts'
import type { GitInteraction } from './types/GitInteraction.ts';
import type { CommitInfo } from './types/CommitInfo.ts';
import type { StashEntryInfo } from './types/StashEntryInfo.ts';
import type { BranchInfo } from './types/BranchInfo.ts';
import Modal from './components/Modal.tsx';
import ContextMenu from './components/ContextMenu.tsx';
import type { CtxMenuButton } from './types/CtxMenuButton.ts';
import * as global from './global.ts';

function App() {
    const [repoPath, setRepoPath] = useState<string>('');
    const [workingTreeFiles, setWorkingTreeFiles] = useState<FileInfo[]>([]);
    const [commits, setCommits] = useState<CommitInfo[]>([]);
    const [branches, setBranches] = useState<BranchInfo[]>([]);
    const [stashEntries, setStashEntries] = useState<StashEntryInfo[]>([]);
    const [gitInteractions, setGitInteractions] = useState<GitInteraction[]>([]);
    const [commitMessage, setCommitMessage] = useState<string>('');
    const [currentBranch, setCurrentBranch] = useState<string>('');

    const [modalTitle, setModalTitle] = useState<string>('');
    const [modalOnSubmit, setModalOnSubmit] = useState<(value: string) => void>(() => {});
    const [modalIsVisible, setModalIsVisible] = useState<boolean>(false);

    const [ctxMenuTop, setCtxMenuTop] = useState<number>(0);
    const [ctxMenuLeft, setCtxMenuLeft] = useState<number>(0);
    const [ctxMenuButtons, setCtxMenuButtons] = useState<CtxMenuButton[]>([]);
    const [ctxMenuIsVisible, setCtxMenuIsVisible] = useState<boolean>(false);

    useEffect(() => {
        fetchAll();
        setGitInteractions(logging.gitInteractions);
        setRepoPath(global.cwd);
    }, []);

    function fetchAll() {
        fetchStatusInfo();
        fetchCurrentBranch();
        fetchCommits();
        fetchBranches();
        fetchStash();
    }

    async function fetchStatusInfo() {
        setWorkingTreeFiles((await status.getStatusInfo()).fileInfos);
    }

    async function fetchCurrentBranch() {
        setCurrentBranch((await status.getStatusInfo()).currentBranch);
    }

    async function fetchCommits() {
        setCommits(await log.getCommits());
    }

    async function fetchBranches() {
        setBranches(await branch.getBranches());
    }

    async function fetchStash() {
        setStashEntries(await stashParsing.getStash());
    }

    async function stageAll() {
        api.stageAll();
        fetchStatusInfo();
    }

    async function unstageAll() {
        api.unstageAll();
        fetchStatusInfo();
    }

    async function stash() {
        api.stash();
        fetchStatusInfo();
        fetchStash();
    }

    async function stashStaged() {
        api.stashStaged();
        fetchStatusInfo();
        fetchStash();
    }

    async function stashApply(stashEntryInfo: StashEntryInfo) {
        api.stashApply(stashEntryInfo.index);
        fetchStatusInfo();
    }

    async function toggleStage(fileInfo: FileInfo) {
        if (fileInfo.isStaged) {
            api.unstage(fileInfo.path);
        } else {
            api.stage(fileInfo.path);
        }

        fetchStatusInfo();
    }

    async function commit() {
        api.commit(commitMessage);
        fetchStatusInfo();
        fetchCommits();
        setCommitMessage('');
    }

    async function checkout(object: CommitInfo | string) {
        let branchNameOrHash;
        if (typeof object === 'string') {
            branchNameOrHash = object;
        } else {
            branchNameOrHash = object.hash;
        }

        api.checkout(branchNameOrHash);
        fetchCurrentBranch();
        fetchCommits();
        fetchBranches();
    }

    async function showCreateNewBranchModal() {
        setModalTitle('New branch name:');
        setModalOnSubmit(() => createNewBranch);
        setModalIsVisible(true);
    }

    async function showSwitchRepoModal() {
        setModalTitle('Repo directory:');
        setModalOnSubmit(() => switchRepo);
        setModalIsVisible(true);
    }

    function createNewBranch(branchName: string) {
        api.branch(branchName);
        fetchBranches();
        fetchCommits();
    }

    function switchRepo(repoPath: string) {
        global.setCwd(repoPath);
        setRepoPath(global.cwd);
        fetchAll();
    }

    function discard(filePath: string) {
        api.discard(filePath);
        fetchStatusInfo();
    }

    function onWorkingTreeFileCtxMenu(event, fileInfo) {
        event.preventDefault();

        setCtxMenuTop(event.clientY);
        setCtxMenuLeft(event.clientX);
        setCtxMenuButtons([
            { text: 'toggle stage', action: () => toggleStage(fileInfo) },
            { text: 'discard', action: () => discard(fileInfo.path) },
        ]);
        setCtxMenuIsVisible(true);
    }

    function onCommitInputKeyDown(event) {
        if (event.key === 'Enter') {
            commit();
        }
    }

    return (
        <div className="root">
            <div className="repo-panel">
                <span>{repoPath}</span>
                <button
                    className="button"
                    onClick={showSwitchRepoModal}
                >
                    SWITCH REPO
                </button>
            </div>

            <div className="main">
                <section className="left-panel panel-column">
                    <section className="panel-column__panel panel">
                        <div className="panel__title-bar">
                            <h2 className="panel__title">branches:</h2>
                        </div>
                        <ul className="panel__body listbox">
                            {branches.map((branch, i) => (
                                <li key={i}>
                                    <button
                                        className="listbox__item"
                                        onClick={() => checkout(branch.branchName)}
                                    >
                                        <span>{branch.isCheckedOut && '> '}</span>
                                        <span>{branch.branchName}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="panel-column__panel panel">
                        <div className="panel__title-bar">
                            <h2 className="panel__title">commits:</h2>
                        </div>
                        <ul className="panel__body listbox">
                            {commits.map((commit, i) => (
                                <li key={i}>
                                    <button
                                        className="listbox__item"
                                        onClick={() => checkout(commit)}
                                    >
                                        <span>{commit.hash} </span>
                                        <span>{commit.message}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="panel-column__panel panel">
                        <div className="panel__title-bar">
                            <h2 className="panel__title">stash:</h2>
                        </div>
                        <ul className="panel__body listbox">
                            {stashEntries.map((stashEntry, i) => (
                                <li key={i}>
                                    <button
                                        className="listbox__item"
                                        onClick={() => stashApply(stashEntry)}
                                    >
                                        <span>{stashEntry.index} </span>
                                        <span>{stashEntry.message}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </section>

                    

                    <section className="panel-column__panel panel">
                        <div className="panel__title-bar">
                            <h2 className="panel__title">working tree:</h2>

                            <div className="panel__controls">
                                <button
                                    className="button"
                                    onClick={stageAll}
                                >
                                    STAGE ALL
                                </button>
                                <button
                                    className="button"
                                    onClick={unstageAll}
                                >
                                    UNSTAGE ALL
                                </button>
                                <button
                                    className="button"
                                    onClick={stash}
                                >
                                    STASH
                                </button>
                                <button
                                    className="button"
                                    onClick={stashStaged}
                                >
                                    STASH STAGED
                                </button>
                            </div>
                        </div>
                        <ul className="panel__body listbox">
                            {workingTreeFiles.map((file, i) => (
                                <li
                                    key={i}
                                >
                                    <button
                                        className="listbox__item"
                                        onClick={() => toggleStage(file)}
                                        onContextMenu={(e) => onWorkingTreeFileCtxMenu(e, file)}
                                        style={{ color: file.isStaged ? 'green' : 'red' }}
                                    >
                                        <span>{file.state}: </span>
                                        <span>{file.path}</span>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <div className="panel-column__panel commit-panel">
                        <input
                            className="commit-panel__input"
                            type="text"
                            value={commitMessage}
                            onChange={(e) => setCommitMessage(e.target.value)}
                            onKeyDown={onCommitInputKeyDown}
                        />

                        <button
                            className="commit-panel__button button"
                            onClick={commit}
                        >
                            COMMIT
                        </button>
                    </div>
                </section>

                <section className="right-panel">
                    <ul className="git-interactions">
                        {gitInteractions.map((interaction, i) => (
                            <li
                                key={i}
                                className="git-interactions__item"
                            >
                                <p className="git-interactions__command">{interaction.command}</p>
                                <p className="git-interactions__response">
                                    {interaction.response === '' ?
                                        '(no response)' :
                                        interaction.response
                                    }
                                </p>
                            </li>
                        ))}
                    </ul>
                </section>
            </div>

            {modalIsVisible &&
                <Modal
                    title={modalTitle}
                    onSubmit={modalOnSubmit}
                    setIsVisible={setModalIsVisible}
                />
            }

            {ctxMenuIsVisible &&
                <ContextMenu
                    top={ctxMenuTop}
                    left={ctxMenuLeft}
                    buttons={ctxMenuButtons}
                    setIsVisible={setCtxMenuIsVisible}
                />
            }
        </div>
    )
}

export default App
