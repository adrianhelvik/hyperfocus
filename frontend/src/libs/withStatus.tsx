import hoist from "hoist-non-react-statics";
import { observable, action } from "mobx";
import styled from "styled-components";
import { Portal } from "react-portal";
import { observer } from "mobx-react";
import React from "react";

export default (Component) => {
    @observer
    class WithConfirm extends React.Component {
        @observable Template = null;
        @observable promise = null;
        @observable resolve = null;
        @observable reject = null;

        @action.bound showStatus(Template) {
            this.Template = Template;
            this.promise = new Promise((resolve, reject) => {
                this.resolve = resolve;
                this.reject = reject;
            });
            return this.promise;
        }

        @action.bound yes() {
            this.resolve(true);
            this.Template = null;
        }

        @action.bound no() {
            this.resolve(false);
            this.Template = null;
        }

        stopPropagation = (e) => {
            e.stopPropagation();
        };

        render() {
            return (
                <React.Fragment>
                    <Component {...this.props} showStatus={this.showStatus} />
                    {this.Template && (
                        <Portal>
                            <Backdrop onClick={this.no}>
                                <Wrapper onClick={this.stopPropagation}>
                                    <this.Template
                                        yes={this.yes}
                                        no={this.no}
                                    />
                                </Wrapper>
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

const Backdrop = styled.div`
    background-color: rgba(0, 0, 0, 0.3);
    position: fixed;
    z-index: 10;
    bottom: 0;
    right: 0;
    left: 0;
    top: 0;
    overflow: auto;
    display: flex;
    align-items: flex-start;
`;

const Wrapper = styled.div`
    background-color: white;
    padding: 20px;
    border-radius: 5px;
    margin: auto;
`;
