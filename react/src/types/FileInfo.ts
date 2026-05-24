const FileState = {
    untracked: 'untracked',
    modified: 'modified',
} as const;

type FileState = (typeof FileState)[keyof typeof FileState];

export { FileState };

export interface FileInfo {
    path: string;
    state: FileState;
    isStaged: boolean;
}