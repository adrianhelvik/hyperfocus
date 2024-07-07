import Store, { StoreContext } from "src/libs/store";
import { observer, Provider } from "mobx-react";
import AppRoutes from "./AppRoutes";
import { observable } from "mobx";
import React from "react";

const components = observable({
  Routes: AppRoutes,
});

if (import.meta.hot) {
  import.meta.hot.accept("./Routes.js", (module) => {
    if (module) components.Routes = module.default;
    else window.location.reload();
  });
  import.meta.hot.accept("store", () => {
    window.location.reload();
  });
}

@observer
export default class App extends React.Component {
  @observable unhandledRejection: any = null;
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
        <Provider store={this.store}>
          <components.Routes />
        </Provider>
      </StoreContext.Provider>
    );
  }
}
