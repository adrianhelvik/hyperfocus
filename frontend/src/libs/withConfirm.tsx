import hoist from "hoist-non-react-statics";
import { observable, action } from "mobx";
import { Portal } from "react-portal";
import { observer } from "mobx-react";
import Backdrop from "src/libs/ui/Backdrop";
import { Coord } from "./types";
import Modal from "src/libs/ui/Modal";
import React from "react";

// Broken types in the library
const AnyPortal = Portal as any;

export type ConfirmTemplateProps = {
  yes: () => void;
  no: () => void;
};

export type WithConfirmProps = {
  confirm: (
    Template: React.ComponentType<ConfirmTemplateProps>
  ) => Promise<boolean>;
  confirmInPlace: (
    event: MouseEvent,
    Template: React.ComponentType<ConfirmTemplateProps>
  ) => Promise<boolean>;
};

export default function withConfirm<Props>(
  Component: React.ComponentType<Props & WithConfirmProps>
): React.ComponentType<Props> {
  @observer
  class WithConfirm extends React.Component<WithConfirmProps & Props> {
    @observable placement: null | Coord = null;
    @observable.ref
    Template: null | React.ComponentType<ConfirmTemplateProps> = null;
    @observable promise: Promise<boolean> | null = null;
    @observable resolve: ((result: boolean) => void) | null = null;
    @observable reject: ((error: Error) => void) | null = null;

    @action.bound confirm(Template: React.ComponentType<ConfirmTemplateProps>) {
      this.Template = Template;
      this.promise = new Promise((resolve, reject) => {
        this.resolve = resolve;
        this.reject = reject;
      });
      return this.promise;
    }

    @action.bound confirmInPlace(
      event: MouseEvent,
      Template: React.ComponentType<ConfirmTemplateProps>
    ) {
      if (typeof event.clientX !== "number")
        throw Error("event.clientX was not a number");
      if (typeof event.clientY !== "number")
        throw Error("event.clientY was not a number");
      const promise = this.confirm(Template);
      this.placement = {
        x: event.clientX,
        y: event.clientY,
      };
      return promise;
    }

    @action.bound yes() {
      if (!this.resolve) return;
      this.resolve(true);
      this.Template = null;
      this.placement = null;
    }

    @action.bound no() {
      if (!this.resolve) return;
      this.resolve(false);
      this.Template = null;
      this.placement = null;
    }

    render() {
      return (
        <React.Fragment>
          <Component
            {...(this.props as Props)}
            confirm={this.confirm}
            confirmInPlace={this.confirmInPlace}
          />
          {this.Template && (
            <AnyPortal>
              <Backdrop hide={this.no}>
                <Modal placement={this.placement} hide={this.no}>
                  <this.Template yes={this.yes} no={this.no} />
                </Modal>
              </Backdrop>
            </AnyPortal>
          )}
        </React.Fragment>
      );
    }
  }

  hoist(WithConfirm as any, Component as any);

  return WithConfirm;
}
