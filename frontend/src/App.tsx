import Store, { StoreContext } from "src/libs/store";
import { observer, Provider } from "mobx-react";
import { observable } from "mobx";
import Routes from "./Routes";
import React from "react";

const components = observable({
    Routes,
});

if (import.meta.hot) {
    import.meta.hot.accept("./Routes.js", (module) => {
        components.Routes = module.default;
    });
    import.meta.hot.accept("store", () => {
        window.location.reload();
    });
}

@observer
export default class App extends React.Component {
    @observable unhandledRejection = null;
    store = new Store();

    componentDidMount() {
        window.addEventListener("unhandledRejection", (e) => {
            this.unhandledRejection = e;
        });
    }

    render() {
        if (this.unhandledRejection)
            return <div>{this.unhandledRejection.stack}</div>;
        return (
            <StoreContext.Provider value={this.store}>
                <Provider store={this.store} children={<components.Routes />} />
            </StoreContext.Provider>
        );
    }
}
