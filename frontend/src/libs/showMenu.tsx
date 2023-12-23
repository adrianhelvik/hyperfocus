import { styled } from "solid-styled-components";
import { For, createEffect, createSignal, onCleanup } from "solid-js";

type Callback = (e: any) => void;
type Option = { label: string; callback: Callback };

const [menu, setMenu] = createSignal<{
    x: number;
    y: number;
    options: Option[];
} | null>(null);

export default function showMenu(
    event: MouseEvent,
    options: Record<string, Callback>,
) {
    const optionsList: Array<Option> = [];

    for (const [label, callback] of Object.entries(options)) {
        optionsList.push({ label, callback });
    }

    setMenu({
        x: event.clientX,
        y: event.clientY,
        options: optionsList,
    });
}

export function MenuRenderer() {
    let container: any;

    createEffect(() => {
        if (!menu()) return;
        const onClick = (event: MouseEvent) => {
            if (!container?.contains(event.target)) {
                setMenu(null);
            }
        };
        document.addEventListener("click", onClick);
        onCleanup(() => {
            document.removeEventListener("click", onClick);
        });
    });

    return (
        <>
            {menu() && (
                <Container
                    ref={container}
                    style={{
                        transform: `translateX(${menu()!.x}px) translateY(${
                            menu()!.y
                        }px)`,
                    }}
                >
                    <For each={menu()!.options}>
                        {(option) => (
                            <button
                                type="button"
                                onClick={(e) => {
                                    option.callback(e);
                                    setMenu(null);
                                }}
                            >
                                {option.label}
                            </button>
                        )}
                    </For>
                </Container>
            )}
        </>
    );
}

const Container = styled.div`
    position: fixed;
    top: 0;
    left: 0;
    background-color: white;
    box-shadow: var(--shadow-2);
    z-index: var(--z-index-tooltip);
`;
