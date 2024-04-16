import { ReactNode, useLayoutEffect, useState } from "react";
import styles from "./useModal.module.css";
import { createPortal } from "react-dom";

export type ModalTemplateProps = {
  resolve: () => void;
};

export type ModalType = {
  showModal: (
    Template: React.ComponentType<ModalTemplateProps>,
    options?: { width?: number }
  ) => Promise<void>;
  showModalInPlace: (
    event: React.MouseEvent,
    Template: React.ComponentType<ModalTemplateProps>
  ) => void;
  renderModal: () => ReactNode;
};

export default function useModal(): ModalType {
  const [openModal, setOpenModal] = useState<any>(null);
  const [root, setRoot] = useState<HTMLDialogElement>();

  useLayoutEffect(() => {
    const root = document.createElement("dialog");
    root.className = styles.dialog;
    document.body.append(root);
    setRoot(root);
    const onClose = () => setOpenModal(root.open);
    root.addEventListener("close", onClose);
    return () => {
      root.remove();
      root.removeEventListener("close", onClose);
    };
  }, []);

  const hasOpenModal = Boolean(openModal);

  useLayoutEffect(() => {
    if (!root) return;
    if (hasOpenModal) {
      if (!root.open) root.showModal();
    } else if (root.open) {
      root.close();
    }
  }, [root, hasOpenModal]);

  return {
    showModal: async (Template) => {
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
      });
      await promise;
      setOpenModal(null);
    },
    showModalInPlace: async (Template) => {
      let resolve: any, reject: any;
      const promise = new Promise<void>((res, rej) => {
        resolve = res;
        reject = rej;
      });
      setOpenModal({
        inPlace: true,
        Template,
        resolve,
        reject,
      });
      await promise;
      setOpenModal(null);
    },
    renderModal: () => {
      if (openModal) {
        const { Template } = openModal;
        return (
          <>{createPortal(<Template resolve={openModal.resolve} />, root)}</>
        );
      }
      return null;
    },
  };
}
