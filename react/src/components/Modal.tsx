import { useEffect, useRef, useState, type Dispatch, type SetStateAction } from "react";

export interface ModalProps {
    title: string;
    onSubmit: (value: string) => void;
    setIsVisible: Dispatch<SetStateAction<boolean>>;
}

export default function Modal(props: ModalProps) {
    const [inputValue, setInputValue] = useState<string>('');

    const inputRef = useRef<HTMLInputElement>(null);

    function onKeyDown(event) {
        if (event.key === 'Enter') {
            props.onSubmit(inputValue);
        }

        if (event.key === 'Enter' || event.key === 'Escape') {
            props.setIsVisible(false);
        }
    }

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    return (
        <>
            <div className="modal">
                <div className="modal__window">
                    <h2 className="modal__title">{props.title}</h2>

                    <input
                        className="modal__input"
                        ref={inputRef}
                        type="text"
                        onKeyDown={onKeyDown}
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                    />
                </div>
            </div>
        </>
    );
}