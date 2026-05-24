import { useEffect, useState } from 'react'
import * as api from './api.ts';
import * as status from './status.ts';
import * as logging from './logging.ts';
import type { FileInfo } from './types/FileInfo.ts'
import type { GitInteraction } from './types/GitInteraction.ts';

function App() {
    const [workingTreeFiles, setWorkingTreeFiles] = useState<FileInfo[]>([]);
    const [gitInteractions, setGitInteractions] = useState<GitInteraction[]>([]);
    const [commitMessage, setCommitMessage] = useState<string>('');


    useEffect(() => {
        setGitInteractions(logging.gitInteractions);
    }, []);

    async function fetchStatusInfo() {
        setWorkingTreeFiles((await status.getStatusInfo()).fileInfos);
    }

    async function stageAll() {
        api.stageAll();
        fetchStatusInfo();
    }

    async function unstageAll() {
        api.unstageAll();
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
        setCommitMessage('');
    }

    return (
        <div className="main">
            <section className="left-panel">
                <button onClick={fetchStatusInfo}>STATUS</button>
                <button onClick={stageAll}>STAGE ALL</button>
                <button onClick={unstageAll}>UNSTAGE ALL</button>

                <ul className="listbox">
                {workingTreeFiles.map((file, i) => (
                    <li
                        key={i}
                    >
                        <button
                            className="listbox__item"
                            onClick={() => toggleStage(file)}
                            style={{ color: file.isStaged ? 'green' : 'red' }}
                        >
                            <span>{file.state}: </span>
                            <span>{file.path}</span>
                        </button>
                    </li>
                ))}
                </ul>

                <textarea
                    value={commitMessage}
                    onChange={(e) => setCommitMessage(e.target.value)}
                />

                <button onClick={commit}>COMMIT</button>
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
    )
}

export default App
