import type { Dispatch, SetStateAction } from "react";
import type { CtxMenuButton } from "../types/CtxMenuButton";

interface ContextMenuProps {
    top: number;
    left: number;
    buttons: CtxMenuButton[];
    setIsVisible: Dispatch<SetStateAction<boolean>>;
}

export default function ContextMenu(props: ContextMenuProps) {
    function onButtonClick(button) {
        button.action();
        props.setIsVisible(false);
    }

    return (
        <ul
            className="context-menu"
            style={{ top: props.top, left: props.left }}
        >
            {props.buttons.map((button, i) => (
                <li key={i}>
                    <button
                        className="context-menu__button"
                        onClick={() => onButtonClick(button)}
                    >
                        {button.text}
                    </button>
                </li>
            ))}
        </ul>
    );
}