import styles from "./Button.module.css";

type ButtonProps = {
    children: HTMLElement | string;
    type?: "button" | "submit";
    $gray?: boolean;
    onClick?: (e: any) => void;
    disabled?: boolean;
    $selected?: boolean;
    $danger?: boolean;
};

export default function Button(props: ButtonProps) {
    return (
        <button
            class={styles.button}
            classList={{
                [styles.$gray]: props.$gray,
                [styles.$selected]: props.$selected,
                [styles.$danger]: props.$danger,
            }}
            type={props.type}
            onClick={props.onClick}
        >
            {props.children}
        </button>
    );
}
