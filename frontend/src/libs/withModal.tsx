import { withRouter } from "react-router-dom";
import hoist from "hoist-non-react-statics";
import { observable, action } from "mobx";
import { observer } from "mobx-react";
import { Portal } from "react-portal";
import Modal from "ui/Modal";
import React from "react";

const withRouterAny = withRouter as any as <T>(c: T) => T;
const PortalAny = Portal as any as React.ComponentType<any>;

export type ModalTemplateProps = {
    resolve: () => void;
};

export type WithModalProps = {
    showModal: (
        Template: React.ComponentType<ModalTemplateProps>,
        options?: { width?: number },
    ) => Promise<void>;
    showModalInPlace: (
        event: React.MouseEvent,
        Template: React.ComponentType<ModalTemplateProps>,
    ) => void;
};

export default function withModal<Props>(
    WrappedComponent: React.ComponentType<Props & WithModalProps>,
): React.ComponentType<Props> {
    @observer
    class NewComponent extends React.Component<WithModalProps & Props> {
        static displayName =
            "withModal(" +
            (WrappedComponent.displayName || WrappedComponent.name) +
            ")";
        static WrappedComponent =
            (WrappedComponent as any).WrappedComponent || WrappedComponent;

        @observable placement = null;
        @observable width = null;
        @observable backdrop = true;
        @observable Template = null;
        @observable promise = null;
        @observable resolve = null;
        @observable reject = null;

        @action.bound showModal(
            Template: React.ComponentType,
            options: { width?: number } = {},
        ) {
            this.promise = new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
                this.Template = Template;
                this.width = options.width || null;
            });
        }

        @action.bound showModalInPlace(event: any, Template: any) {
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
                <>
                    <WrappedComponent
                        {...this.props}
                        showModal={this.showModal}
                        showModalInPlace={this.showModalInPlace}
                    />
                    {typeof this.Template === "function" ? (
                        <PortalAny>
                            <Modal
                                hide={this.hide}
                                placement={this.placement}
                                backdrop={this.backdrop}
                                width={this.width}
                            >
                                <this.Template resolve={this.hide} />
                            </Modal>
                        </PortalAny>
                    ) : null}
                </>
            );
        }
    }

    hoist(withRouterAny(NewComponent) as any, WrappedComponent as any);

    return NewComponent;
}
