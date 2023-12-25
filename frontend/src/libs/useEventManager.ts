import { createSignal, onCleanup } from "solid-js";

type EventHandler = { target: any; event: string; fn: Function };

export default function useEventManager() {
    const [handlers, setHandlers] = createSignal<EventHandler[]>([]);

    const on = (target: any, event: string, fn: Function) => {
        setHandlers((handlers) => handlers.concat({ target, event, fn }));
    };

    const off = (target: any, event: string) => {
        const affectedHandlers = new Set(
            handlers().filter(
                (it) => it.target === target && it.event === event,
            ),
        );
        setHandlers(handlers().filter((it) => !affectedHandlers.has(it)));
        affectedHandlers.forEach((it) =>
            it.target.removeEventListener(it.event, it.fn),
        );
    };

    onCleanup(() => {
        handlers().forEach((it) =>
            it.target.removeEventListener(it.event, it.fn),
        );
    });

    return {
        on,
        off,
    };
}
