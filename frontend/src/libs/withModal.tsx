import { Portal } from "react-portal";
import { Coord } from "./types";
import Modal from "./ui/Modal";
import React, { useState } from "react";

const PortalAny = Portal as any as React.ComponentType<any>;

export type ModalTemplateProps = {
  resolve: () => void;
};

export type WithModalProps = {
  showModal: (
    Template: React.ComponentType<ModalTemplateProps>,
    options?: { width?: number }
  ) => Promise<void>;
  showModalInPlace: (
    event: React.MouseEvent,
    Template: React.ComponentType<ModalTemplateProps>
  ) => void;
};

export default function withModal<Props>(
  WrappedComponent: React.ComponentType<Props & WithModalProps>
): React.ComponentType<Props> {
  function NewComponent(props: WithModalProps & Props) {
    const [placement, setPlacement] = useState<null | Coord>(null);
    const [width, setWidth] = useState<number | null>(null);
    const [backdrop, setBackdrop] = useState(true);
    const [Template, setTemplate] = useState<React.ComponentType<any> | null>(null);
    const [resolve, setResolve] = useState<(() => void) | null>(null);

    const showModal = (
      Template: React.ComponentType<any>,
      options: { width?: number } = {}
    ) => {
      const promise = new Promise((resolve) => {
        setResolve(() => resolve);
        setTemplate(() => Template);
        setWidth(options.width || null);
      });
      return promise;
    }

    const showModalInPlace = (event: any, Template: any) => {
      showModal(Template);
      setPlacement({
        x: event.clientX,
        y: event.clientY,
      });
      setBackdrop(false);
      setWidth(null);
    }

    const hide = () => {
      if (resolve) resolve();
      setPlacement(null);
      setBackdrop(true);
      setTemplate(null);
      setResolve(null);
      setWidth(null);
    }

    return (
      <>
        <WrappedComponent
          {...props}
          showModal={showModal}
          showModalInPlace={showModalInPlace}
        />
        {typeof Template === "function" ? (
          <PortalAny>
            <Modal
              hide={hide}
              placement={placement}
              backdrop={backdrop}
              width={width}
            >
              <Template resolve={hide} />
            </Modal>
          </PortalAny>
        ) : null}
      </>
    );
  }

  return NewComponent as any;
}
