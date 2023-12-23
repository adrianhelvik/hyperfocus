import { createEffect, createMemo, createSignal } from "solid-js";
import styles from "./Input.module.css";

type Props = {
    onChange: (value: string) => void;
    type?: string;
    autoFocus?: boolean;
    value: string | (() => string);
    placeholder?: string;
};

export default function Input(props: Props) {
    const [showPassword, setShowPassword] = createSignal(false);
    const [element, setElement] = createSignal<HTMLInputElement | undefined>(
        undefined,
    );

    const type = createMemo(() => {
        if (showPassword()) return "text";
        return props.type;
    });

    createEffect(() => {
        if (!props.autoFocus) return;
        console.log("autoFocus");
        element()?.focus();
    });

    createEffect(() => {
        if (!showPassword()) return;
        const onMouseUp = () => {
            setShowPassword(false);
        };
        document.addEventListener("mouseup", onMouseUp);
        return () => {
            document.removeEventListener("mouseup", onMouseUp);
        };
    });

    const show = () => setShowPassword(true);

    return (
        <div class={styles.container}>
            <label>
                <input
                    class={styles.input}
                    onChange={e => props.onChange(e.target.value)}
                    value={typeof props.value === "string" ? props.value : props.value()}
                    ref={setElement}
                    type={showPassword() ? "text" : type()}
                />
                <div
                    classList={{
                        [styles.labelText]: true,
                        [styles.hasContent]: Boolean(props.value),
                    }}
                >
                    {props.placeholder}
                </div>
            </label>
            {props.type === "password" && (
                <i
                    classList={{
                        [styles.icon]: true,
                        "material-icons": true,
                        [styles.colored]: showPassword(),
                    }}
                    onMouseDown={show}
                >
                    remove_red_eye
                </i>
            )}
        </div>
    );
}
