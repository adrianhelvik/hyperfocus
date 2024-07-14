import React, { useState } from "react";
import ReactDOM from "react-dom";
import { Coord } from "./types";
import Modal from "./ui/Modal";

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
    const [Template, setTemplate] = useState<React.ComponentType<any> | null>(
      null
    );
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
    };

    const showModalInPlace = (event: any, Template: any) => {
      let x = event.clientX;
      let y = event.clientY;

      if (event.pointerId === -1 && (event.target instanceof HTMLElement)) {
        const rect = event.target.getBoundingClientRect();

        x = rect.left;
        y = rect.top + rect.height;
      }

      showModal(Template);
      setPlacement({ x, y });
      setBackdrop(false);
      setWidth(null);
    };

    const hide = () => {
      if (resolve) resolve();
      setPlacement(null);
      setBackdrop(true);
      setTemplate(null);
      setResolve(null);
      setWidth(null);
    };

    return (
      <>
        <WrappedComponent
          {...props}
          showModal={showModal}
          showModalInPlace={showModalInPlace}
        />
        {typeof Template === "function" ? (
          ReactDOM.createPortal(
            <Modal
              hide={hide}
              placement={placement}
              backdrop={backdrop}
              width={width}
            >
              <Template resolve={hide} />
            </Modal>,
            document.body
          )
        ) : null}
      </>
    );
  }

  return NewComponent as any;
}
