import hoist from "hoist-non-react-statics";
import { observable, action } from "mobx";
import styled from "styled-components";
import { Portal } from "react-portal";
import { observer } from "mobx-react";
import React from "react";

const PortalAny = Portal as any as React.ComponentType<any>;

export type StatusTemplateProps = {
  yes: () => void;
  no: () => void;
};

export type WithStatusProps = {
  showStatus: (
    Template: React.ComponentType<StatusTemplateProps>
  ) => Promise<boolean>;
};

type TemplateType = React.ComponentType<StatusTemplateProps>;

export default function withStatus<Props>(
  Component: React.ComponentType<Props & WithStatusProps>
): React.ComponentType<Props> {
  @observer
  class WithConfirm extends React.Component {
    @observable Template: TemplateType | null = null;
    @observable promise: Promise<any> | null = null;
    @observable resolve: any = null;
    @observable reject: any = null;

    @action.bound showStatus(Template: TemplateType) {
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

    stopPropagation = (e: { stopPropagation: () => void }) => {
      e.stopPropagation();
    };

    render() {
      const { Template } = this;

      const ComponentAny = Component as any;

      return (
        <>
          <ComponentAny {...this.props} showStatus={this.showStatus} />
          {Template && (
            <PortalAny>
              <Backdrop onClick={this.no}>
                <Wrapper onClick={this.stopPropagation}>
                  <Template yes={this.yes} no={this.no} />
                </Wrapper>
              </Backdrop>
            </PortalAny>
          )}
        </>
      );
    }
  }

  hoist(WithConfirm as any, Component as any);

  return WithConfirm as any;
}

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
