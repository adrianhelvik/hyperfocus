import hoistNonReactStatics from "hoist-non-react-statics";
import * as zIndexes from "../zIndexes";
import sleep from "../util/sleep";
import assert from "assert";
import React from "react";

export default (options) => (Component) => {
    const { close, time = 300 } = options;

    assert(close, "close is a required option");
    assert(time, "time must be a number");

    class NewComponent extends React.Component {
        static displayName = `fade(${Component.displayName || Component.name})`;

        state = {
            visible: false,
        };

        componentDidMount() {
            requestAnimationFrame(() => {
                this.setState({
                    visible: true,
                });
            });
        }

        close = async (...args) => {
            this.setState({
                visible: false,
            });

            await sleep(time);

            if (typeof this.props[close] !== "function")
                throw Error(`this.props.${close} was not a function`);
            return this.props[close](...args);
        };

        style() {
            return {
                opacity: this.state.visible ? 1 : 0,
                transition: `${time}ms`,
                zIndex: zIndexes.fade,
                position: "relative",
            };
        }

        render() {
            const props = {
                ...this.props,
                [close]: this.close,
            };

            return (
                <div style={this.style()}>
                    <Component {...props} />
                </div>
            );
        }
    }

    hoistNonReactStatics(NewComponent, Component);

    return NewComponent;
};
