import { JSX } from "solid-js";

// TODO
export default function showModal<Props extends { resolve: () => void }>(
    _fn: (props: Props) => JSX.Element,
    _opts?: any,
) {
    return Promise.resolve();
}
