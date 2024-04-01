import { Children, ReactNode } from "react";

export default function DragItems(props: { children: ReactNode }) {
    return (
        <div>
            {Children.map(props.children, (child) => {
                return child;
            })}
        </div>
    );
}
