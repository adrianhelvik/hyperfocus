import React, { ReactNode, useContext, useState } from "react";
import { useAutoCallback, useAutoMemo } from "hooks.macro";
import api, { setPersistentHeader } from "src/libs/api";

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
    const auth = React.useContext(AuthContext)!;

    return <WrappedComponent {...props} auth={auth} />;
  };

  WithAuth.displayName = `withContext(${name})`;

  return WithAuth;
}

export function useAuth(): Auth {
  return useContext(AuthContext)!;
}

export function ProvideAuth(props: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("pending");

  const authenticate = useAutoCallback(async (): Promise<boolean> => {
    if (status === "success") return true;
    try {
      await api.authenticate();
      setStatus("success");
      return true;
    } catch (e) {
      console.log("%cauthentication failed", "background:red;padding:4px");
      setStatus("failure");
      return false;
    }
  });

  const login = useAutoCallback(
    async (payload: { username: string; password: string }) => {
      setStatus("pending");
      const { sessionId } = await api.login(payload);
      setPersistentHeader("Authorization", `Bearer ${sessionId}`);
      await authenticate();
    }
  );

  const logout = async (): Promise<void> => {
    await api.logout();
    window.location.href = "/";
  };

  const auth = useAutoMemo({
    authenticate,
    logout,
    login,
    status,
  });

  return (
    <AuthContext.Provider value={auth}>{props.children}</AuthContext.Provider>
  );
}
