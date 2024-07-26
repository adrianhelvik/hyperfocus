import React, { ComponentType, useState } from "react";
import hoist from "hoist-non-react-statics";
import Backdrop from "src/libs/ui/Backdrop";
import { Portal } from "react-portal";
import Modal from "src/libs/ui/Modal";
import { Coord } from "./types";
import useStableCallback from "src/util/useStableCallback";

// Broken types in the library
const AnyPortal = Portal as any;

export type ConfirmTemplateProps = {
  yes: () => void;
  no: () => void;
};

export type ConfirmFn = (
  Template: ComponentType<ConfirmTemplateProps>
) => Promise<boolean>;

export type ConfirmInPlaceFn = (
  event: MouseEvent,
  Template: React.ComponentType<ConfirmTemplateProps>
) => Promise<boolean>;

export type WithConfirmProps = {
  confirm: ConfirmFn;
  confirmInPlace: ConfirmInPlaceFn;
};

export default function withConfirm<Props extends Record<string, any>>(
  Component: React.ComponentType<Props & WithConfirmProps>
): React.ComponentType<Props> {
  function WithConfirm(props: Props) {
    const [placement, setPlacement] = useState<null | Coord>(null);
    const [Template, setTemplate] =
      useState<null | React.ComponentType<ConfirmTemplateProps>>(null);
    const [resolve, setResolve] = useState<((result: boolean) => void) | null>(
      null
    );

    const confirm = useStableCallback((Template: React.ComponentType<ConfirmTemplateProps>) => {
      setTemplate(() => Template);
      const promise = new Promise<boolean>((resolve) => {
        setResolve(() => resolve);
      });
      return promise;
    });

    const confirmInPlace = useStableCallback((
      event: MouseEvent,
      Template: React.ComponentType<ConfirmTemplateProps>
    ) => {
      if (typeof event.clientX !== "number")
        throw Error("event.clientX was not a number");
      if (typeof event.clientY !== "number")
        throw Error("event.clientY was not a number");
      const promise = confirm(Template);
      const x = event.clientX;
      const y = event.clientY;
      if (x !== 0 || y !== 0) {
        setPlacement({
          x,
          y,
        });
      } else {
        setPlacement(null);
      }
      return promise;
    });

    const yes = useStableCallback(() => {
      if (!resolve) return;
      resolve(true);
      setTemplate(null);
      setPlacement(null);
    });

    const no = useStableCallback(() => {
      if (!resolve) return;
      resolve(false);
      setTemplate(null);
      setPlacement(null);
    });

    return (
      <>
        <Component
          {...props}
          confirm={confirm}
          confirmInPlace={confirmInPlace}
        />
        {Template && (
          <AnyPortal>
            <Backdrop hide={no}>
              <Modal placement={placement} hide={no}>
                <Template yes={yes} no={no} />
              </Modal>
            </Backdrop>
          </AnyPortal>
        )}
      </>
    );
  }

  return WithConfirm;
}
