import type { Dispatch, SetStateAction } from "react";
import type { CtxMenuButton } from "../types/CtxMenuButton";

interface ContextMenuProps {
    top: number;
    left: number;
    buttons: CtxMenuButton[];
    setIsVisible: Dispatch<SetStateAction<boolean>>;
}

export default function ContextMenu(props: ContextMenuProps) {
    function onBackgroundClick(event) {
        if (event.target === event.currentTarget) {
            props.setIsVisible(false);
        }
    }

    function onButtonClick(button) {
        button.action();
        props.setIsVisible(false);
    }

    return (
        <div
            className="context-menu"
            onClick={onBackgroundClick}
        >
            <ul
                className="context-menu__window"
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
        </div>
    );
}