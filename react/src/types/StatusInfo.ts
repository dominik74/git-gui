import type { FileInfo } from "./FileInfo";

export interface StatusInfo {
    currentBranch: string;
    fileInfos: FileInfo[];
}