import styles from "./Button.module.css";

type ButtonProps = {
    children: HTMLElement | string;
    type?: "button" | "submit";
    $gray?: boolean;
    onClick?: (e: any) => void;
};

export default function Button(props: ButtonProps) {
    return (
        <button
            class={styles.button}
            classList={{
                [styles.$gray]: props.$gray,
            }}
            type={props.type}
            onClick={props.onClick}
        >
            {props.children}
        </button>
    );
}
