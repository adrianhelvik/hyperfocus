import hoist from "hoist-non-react-statics";
import React from "react";

export type WithEventsProps = {
    on: (
        target: EventTarget,
        eventName: string,
        handler: (event: any) => void
    ) => void;
    off: (target: EventTarget, eventName: string) => void;
};

export default function withEvents<Props>(
    WrappedComponent: React.ComponentType<Props & WithEventsProps>
): React.ComponentType<Props> {
    class NewComponent extends React.Component<Props & WithEventsProps> {
        unmounted = false;

        listeners: Array<{
            target: EventTarget;
            eventName: string;
            handler: (event: Event) => void;
        }> = [];

        on = (
            target: Node,
            eventName: string,
            handler: (event: any) => void
        ) => {
            if (this.unmounted) {
                console.error(
                    "Attempted to add event listener after unmounting. This is a noop"
                );
                return;
            }
            this.listeners.push({ target, eventName, handler });
            target.addEventListener(eventName, handler);
        };

        off = (target: Node, eventName: string) => {
            const listeners: Array<{
                target: EventTarget;
                eventName: string;
                handler: (event: Event) => void;
            }> = [];

            const toRemove: Array<{
                target: EventTarget;
                eventName: string;
                handler: (event: Event) => void;
            }> = [];

            for (const listener of this.listeners) {
                if (
                    listener.target === target &&
                    listener.eventName === eventName
                )
                    toRemove.push(listener);
                else listeners.push(listener);
            }

            for (const { target, eventName, handler } of toRemove)
                target.removeEventListener(eventName, handler);

            this.listeners = listeners;
        };

        componentWillUnmount() {
            this.unmounted = true;
            for (const { target, eventName, handler } of this.listeners)
                target.removeEventListener(eventName, handler);
        }

        render() {
            return (
                <WrappedComponent {...this.props} on={this.on} off={this.off} />
            );
        }
    }

    hoist(NewComponent as any, WrappedComponent as any);

    return NewComponent;
}
