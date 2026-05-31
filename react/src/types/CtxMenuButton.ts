export interface CtxMenuButton {
    text: string;
    action: () => void | Promise<void>;
}