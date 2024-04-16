import React, { ReactNode, createContext, useCallback, useMemo } from "react";
import Backdrop from "src/libs/ui/Backdrop";
import { Portal } from "react-portal";
import Modal from "src/libs/ui/Modal";

// Broken types in the library
const AnyPortal = Portal as any;

export type ConfirmTemplateProps = {
  yes: () => void;
  no: () => void;
};

export type Confirm = {
  confirm: (
    Template: React.ComponentType<ConfirmTemplateProps>
  ) => Promise<boolean>;
  confirmInPlace: (
    event: MouseEvent,
    Template: React.ComponentType<ConfirmTemplateProps>
  ) => Promise<boolean>;
};

export default function useConfirm(): Confirm {
  const confirm = useCallback(() => {
    return Promise.resolve(false);
  }, []);

  const confirmInPlace = useCallback(() => {
    return Promise.resolve(false);
  }, []);

  return {
    confirm,
    confirmInPlace,
  };
}

const ConfirmContext = createContext<ConfirmStore | null>(null);

export function ConfirmRenderer({ children }: { children: ReactNode }) {
  const confirmStore = useMemo(() => new confirmStore(), []);

  return (
    <ConfirmContext.Provider value={confirmStore}>
      {children}
      {this.Template && (
        <AnyPortal>
          <Backdrop hide={this.no}>
            <Modal placement={this.placement} hide={this.no}>
              <this.Template yes={this.yes} no={this.no} />
            </Modal>
          </Backdrop>
        </AnyPortal>
      )}
    </ConfirmContext.Provider>
  );
}

class ConfirmStore {}
