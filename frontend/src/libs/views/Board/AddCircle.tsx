import withEvents, { WithEventsProps } from "util/withEvents";
import styled, { keyframes, css } from "styled-components";
import { observer } from "mobx-react";
import { observable } from "mobx";
import * as theme from "theme";
import React from "react";

type Props = WithEventsProps & {
    children: React.ReactNode;
};

@observer
class AddCircle extends React.Component<Props> {
    @observable mounted = false;
    @observable open = false;
    container: HTMLElement;

    componentDidMount() {
        setTimeout(() => {
            this.mounted = true;
        }, 400);
        document.addEventListener("click", this.onDocumentClick);
    }

    componentWillUnmount() {
        document.removeEventListener("click", this.onDocumentClick);
    }

    onDocumentClick = (event: MouseEvent) => {
        if (!(event.target instanceof Element)) {
            return;
        }
        if (this.container.contains(event.target)) {
            return;
        }

        this.open = false;
    };

    onClick = () => {
        this.open = !this.open;
    };

    render() {
        return (
            <Container
                onClick={this.onClick}
                ref={(e) => (this.container = e)}
                mounted={this.mounted}
                open={this.open}
            >
                <Content open={this.open} mounted={this.mounted}>
                    {this.props.children}
                </Content>
                <VerticalLine mounted={this.mounted} open={this.open} />
                <HorizontalLine mounted={this.mounted} open={this.open} />
            </Container>
        );
    }
}

export default withEvents(AddCircle);

const diameter = 60;
const height = 110;
const width = 200;

const Container = styled.div<{ open: boolean; mounted: boolean }>`
    background-color: ${theme.ui1};
    position: fixed;
    bottom: 20px;
    right: 20px;
    width: ${diameter}px;
    height: ${diameter}px;
    text-align: center;
    border-radius: ${diameter}px;
    animation: ${(p) => (p.open ? openAnimation : closeAnimation)}
        ${(p) => (p.mounted ? ".3s" : "0s")};
    animation-fill-mode: forwards;
    cursor: pointer;
`;

const stage1 = css`
    border-radius: ${diameter};
    bottom: 20px;
    right: 20px;
    width: ${diameter}px;
`;

const stage2 = css`
    border-radius: 0;
    border-top-left-radius: 4px;
    bottom: 0px;
    right: 0px;
    width: ${width}px;
`;

const stage3 = css`
    height: ${height}px;
    width: ${width}px;
    bottom: 0px;
    right: 0px;
    border-radius: 0;
    border-top-left-radius: 4px;
`;

const openAnimation = keyframes`
  0% {
    ${stage1}
  }
  50% {
    ${stage2}
  }
  100% {
    ${stage3}
  }
`;

const closeAnimation = keyframes`
  0% {
    ${stage3}
  }
  50% {
    ${stage2}
  }
  100% {
    ${stage1}
  }
`;

const lineHeight = 20;
const lineWidth = 3;

const Line = styled.div<{ open: boolean; mounted: boolean }>`
    background: white;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translateX(-50%) translateY(-50%);
    pointer-events: none;
    animation: ${(p) => (p.open ? lineOpen : lineClosed)}
        ${(p) => (p.mounted ? ".3s" : "0s")};
    animation-fill-mode: forwards;
`;

const lineOpen = keyframes`
  0% {
    opacity: 1;
  }
  100% {
    opacity: 0;
  }
`;

const lineClosed = keyframes`
  0% {
    opacity: 0;
  }
  100% {
    opacity: 1;
  }
`;

const VerticalLine = styled(Line)`
    width: ${lineWidth}px;
    height: ${lineHeight}px;
`;

const HorizontalLine = styled(Line)`
    width: ${lineHeight}px;
    height: ${lineWidth}px;
`;

const Content = styled.div<{ open: boolean; mounted: boolean }>`
    transition: 0.3s;
    opacity: ${(p) => (p.open ? 1 : 0)};
    pointer-events: ${(p) => !p.open && "none"};
`;
