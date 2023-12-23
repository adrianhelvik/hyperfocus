import { pendingActions, setPendingActions } from "store";
import { createEffect } from "solid-js";
import Routes from "./Routes";
import { MenuRenderer } from "./libs/showMenu";

export default function App() {
    let promise = Promise.resolve();

    createEffect(() => {
        const actions = pendingActions();
        if (!actions.length) return;
        setPendingActions([]);

        for (const action of actions) {
            promise = promise.then(
                () => {
                    console.log(`Performing action: ${action.name}`);
                    return action.operation();
                },
                (error) => {
                    alert(error.message);
                },
            );
        }
    });

    return <>
        <Routes />
        <MenuRenderer />
    </>;
}
