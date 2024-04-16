import api, { setPersistentHeader } from "src/libs/api";
import { observable, computed, action } from "mobx";
import hoist from "hoist-non-react-statics";
import React, { useContext } from "react";
import { observer } from "mobx-react";

type Status = "pending" | "success" | "failure";

export type Auth = {
  authenticate: () => Promise<boolean>;
  logout: () => Promise<void>;
  login: (payload: { username: string; password: string }) => Promise<void>;
  status: Status;
};

export type WithAuthProps = { auth: Auth };

export const AuthContext = React.createContext<Auth | null>(null);

export function withAuth<Props>(
  WrappedComponent: React.ComponentType<Props & WithAuthProps>
): React.ComponentType<Props> {
  const name =
    WrappedComponent.displayName || WrappedComponent.name || "<component>";

  const WithAuth = (props: Props) => {
    const auth = React.useContext(AuthContext);

    return <WrappedComponent {...props} auth={auth} />;
  };

  WithAuth.displayName = `withContext(${name})`;

  hoist(WithAuth, WrappedComponent as any);

  return WithAuth;
}

export function useAuth() {
  return useContext(AuthContext);
}

@observer
export class ProvideAuth extends React.Component<{
  children: React.ReactElement;
}> {
  @observable status: Status = "pending";

  @action setStatus(status: Status) {
    this.status = status;
  }

  async login(payload: { username: string; password: string }) {
    this.setStatus("pending");
    const { sessionId } = await api.login(payload);
    setPersistentHeader("Authorization", `Bearer ${sessionId}`);
    await this.authenticate();
  }

  async authenticate(): Promise<boolean> {
    try {
      await api.authenticate();
      this.setStatus("success");
      return true;
    } catch (e) {
      console.log("%cauthentication failed", "background:red;padding:4px");
      this.setStatus("failure");
      return false;
    }
  }

  async logout(): Promise<void> {
    await api.logout();
    window.location.href = "/";
  }

  @computed get auth() {
    return {
      authenticate: this.authenticate.bind(this),
      logout: this.logout.bind(this),
      login: this.login.bind(this),
      status: this.status,
    };
  }

  render() {
    if (!this.auth.login) throw Error("Failure");

    return (
      <AuthContext.Provider value={this.auth}>
        {this.props.children}
      </AuthContext.Provider>
    );
  }
}
