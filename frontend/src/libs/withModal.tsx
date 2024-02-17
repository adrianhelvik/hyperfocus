import { withRouter } from "react-router-dom";
import hoist from "hoist-non-react-statics";
import { observable, action } from "mobx";
import { observer } from "mobx-react";
import { Portal } from "react-portal";
import Modal from "ui/Modal";
import React from "react";

export default (WrappedComponent: any) => {
    @withRouter
    @observer
    class NewComponent extends React.Component {
        static displayName =
            "withModal(" +
            (WrappedComponent.displayName || WrappedComponent.name) +
            ")";
        static WrappedComponent =
            WrappedComponent.WrappedComponent || WrappedComponent;

        @observable placement = null;
        @observable width = null;
        @observable backdrop = true;
        @observable Template = null;
        @observable promise = null;
        @observable resolve = null;
        @observable reject = null;

        @action.bound showModal(Template, options = {}) {
            this.promise = new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
                this.Template = Template;
                this.width = options.width || null;
            });
        }

        @action.bound showModalInPlace(event, Template) {
            this.showModal(Template);
            this.placement = {
                x: event.clientX,
                y: event.clientY,
            };
            this.backdrop = false;
            this.width = null;
        }

        @action.bound hide() {
            this.resolve();
            this.placement = null;
            this.backdrop = true;
            this.Template = null;
            this.promise = null;
            this.resolve = null;
            this.reject = null;
            this.width = null;
        }

        render() {
            return (
                <React.Fragment>
                    <WrappedComponent
                        {...this.props}
                        showModal={this.showModal}
                        showModalInPlace={this.showModalInPlace}
                    />
                    {typeof this.Template === "function" ? (
                        <Portal>
                            <Modal
                                hide={this.hide}
                                placement={this.placement}
                                backdrop={this.backdrop}
                                width={this.width}
                            >
                                <this.Template resolve={this.hide} />
                            </Modal>
                        </Portal>
                    ) : null}
                </React.Fragment>
            );
        }
    }

    hoist(NewComponent, WrappedComponent);

    return NewComponent;
};
