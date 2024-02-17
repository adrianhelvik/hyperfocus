import { Confirmable, Coord } from "./types";
import hoist from "hoist-non-react-statics";
import { observable, action } from "mobx";
import { Portal } from "react-portal";
import { observer } from "mobx-react";
import Backdrop from "ui/Backdrop";
import Modal from "ui/Modal";
import React from "react";

export default (Component: Confirmable) => {
    @observer
    class WithConfirm extends React.Component {
        @observable placement: null | Coord = null;
        @observable.ref Template: null | React.FC = null;
        @observable promise: Promise<boolean> | null = null;
        @observable resolve: ((result: boolean) => void) | null = null;
        @observable reject: ((error: Error) => void) | null = null;

        @action.bound confirm(Template: React.FC) {
            this.Template = Template;
            this.promise = new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
            });
            return this.promise;
        }

        @action.bound confirmInPlace(event: MouseEvent, Template: React.FC) {
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
                        {...this.props}
                        confirm={this.confirm}
                        confirmInPlace={this.confirmInPlace}
                    />
                    {this.Template && (
                        <Portal>
                            <Backdrop hide={this.no}>
                                <Modal
                                    placement={this.placement}
                                    hide={this.no}
                                >
                                    <this.Template
                                        yes={this.yes}
                                        no={this.no}
                                    />
                                </Modal>
                            </Backdrop>
                        </Portal>
                    )}
                </React.Fragment>
            );
        }
    }

    hoist(WithConfirm, Component);

    return WithConfirm;
};
