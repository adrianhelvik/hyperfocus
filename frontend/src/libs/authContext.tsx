import React, { ReactNode, useContext, useEffect, useState } from "react";
import { useAutoCallback, useAutoMemo } from "hooks.macro";
import api, { ApiError, setPersistentHeader } from "src/libs/api";
import { useNavigate } from "react-router-dom";

type Status = "pending" | "success" | "invalid" | "error";
type Role = "none" | "user" | "admin";

export type Auth = {
  authenticate: () => Promise<boolean>;
  logout: () => Promise<void>;
  login: (payload: { username: string; password: string }) => Promise<void>;
  role: Role;
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

export function useAuthenticateOrRedirect() {
  const navigate = useNavigate();
  const auth = useAuth();

  useEffect(() => {
    if (auth.status === "invalid") {
      navigate("/login", { replace: true });
    }
  }, [auth.status, navigate]);

  useEffect(() => {
    auth.authenticate();
  }, [auth]);
}

export function ProvideAuth(props: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("pending");
  const [role, setRole] = useState<Role>("none");

  const authenticate = useAutoCallback(async (): Promise<boolean> => {
    if (status === "success") return true;
    try {
      const user = await api.authenticate();
      setStatus("success");
      setRole(user.role)
      return true;
    } catch (e: unknown) {
      if (e instanceof ApiError && ((e.statusCode / 100) | 0) === 4) {
        setStatus("invalid");
        return false
      } else {
        console.error(e);
        setStatus("error");
        return false;
      }
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
    role,
  });

  return (
    <AuthContext.Provider value={auth}>{props.children}</AuthContext.Provider>
  );
}
