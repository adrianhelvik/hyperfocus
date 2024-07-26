import { ComponentType, ReactNode, useState } from "react";
import { useAutoCallback } from "hooks.macro";
import { createPortal } from "react-dom";
import Modal from "./ui/Modal";

export type ModalTemplateProps = {
  resolve: () => void;
};

export type ModalType = {
  showModal: (options: {
    title: ReactNode,
    Template: ComponentType<ModalTemplateProps>,
    width?: number,
  }) => Promise<void>;
  renderModal: () => ReactNode;
};

export type ModalHookOptions = {
  Template: ComponentType<ModalTemplateProps>;
  title: ReactNode;
  inPlace: boolean;
  width?: number;
  resolve: () => boolean;
  reject: () => void;
};

export default function useModal(): ModalType {
  const [openModal, setOpenModal] = useState<ModalHookOptions | null>(null);

  const hide = useAutoCallback(() => {
    setOpenModal(null);
  });

  return {
    showModal: async ({ title, Template, width }) => {
      let resolve: any, reject: any;
      const promise = new Promise<void>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      setOpenModal({
        inPlace: false,
        Template,
        resolve,
        reject,
        title,
        width,
      });
      await promise;
      setOpenModal(null);
    },
    renderModal: () => {
      if (openModal) {
        const { Template } = openModal;
        return (
          <>
            {createPortal(
              <Modal
                title={openModal.title}
                width={openModal.width}
                blurBg
                hide={hide}
              >
                <Template
                  resolve={openModal.resolve}
                />
              </Modal>,
              document.body
            )}
          </>
        );
      }
      return null;
    },
  };
}
