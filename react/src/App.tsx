import { useState } from 'react'
import * as api from './api.ts';
import * as status from './status.ts';
import * as logging from './logging.ts';
import type { FileInfo } from './types/FileInfo.ts'
import type { GitInteraction } from './types/GitInteraction.ts';

function App() {
    const [workingTreeFiles, setWorkingTreeFiles] = useState<FileInfo[]>([]);
    const [gitInteractions, setGitInteractions] = useState<GitInteraction[]>([]);
    const [commitMessage, setCommitMessage] = useState<string>('');


    async function fetchStatusInfo() {
        setWorkingTreeFiles((await status.getStatusInfo()).fileInfos);
    }

    async function fetchGitInteractions() {
        setGitInteractions(logging.gitInteractions);
    }

    async function stageAll() {
        api.stageAll();
    }

    async function unstageAll() {
        api.unstageAll();
    }

    async function toggleStage(fileInfo: FileInfo) {
        if (fileInfo.isStaged) {
            api.unstage(fileInfo.path);
        } else {
            api.stage(fileInfo.path);
        }
    }

    async function commit() {
        api.commit(commitMessage);
        setCommitMessage('');
    }

    return (
        <>
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

            <button onClick={fetchStatusInfo}>STATUS</button>
            <button onClick={stageAll}>STAGE ALL</button>
            <button onClick={unstageAll}>UNSTAGE ALL</button>

            <textarea
                value={commitMessage}
                onChange={(e) => setCommitMessage(e.target.value)}
            />

            <button onClick={commit}>COMMIT</button>

            <ul>
                {gitInteractions.map((interaction, i) => (
                    <li key={i}>
                        <p>{interaction.command}</p>
                        <p>
                            {interaction.response === '' ?
                                '(no response)' :
                                interaction.response
                            }
                        </p>
                    </li>
                ))}
            </ul>

            <button onClick={fetchGitInteractions}>INTERACTIONS</button>
        </>
    )
}

export default App
