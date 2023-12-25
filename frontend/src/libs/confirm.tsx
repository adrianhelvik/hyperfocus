import { JSX } from "solid-js";

export default function confirm(
    _fn: (opts: { yes: () => void; no: () => void }) => JSX.Element,
): Promise<boolean> {
    // TODO
    return Promise.resolve(false);
}
