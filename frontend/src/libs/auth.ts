import { createSignal } from "solid-js";
import api, { setPersistentHeader } from "api";

type Status = "pending" | "success" | "failure";

interface Auth {
    authenticate: () => Promise<boolean>;
    logout: () => Promise<void>;
    login: (payload: { username: string; password: string }) => Promise<void>;
    status: Status;
}

const [status, setStatus] = createSignal<Status>("pending");

const auth: Auth = {
    async authenticate() {
        try {
            await api.authenticate();
            setStatus("success");
            return true;
        } catch (e) {
            console.log(
                "%cauthentication failed",
                "background:red;padding:4px",
            );
            setStatus("failure");
            return false;
        }
    },
    async logout() {
        await api.logout();
        window.location.href = "/";
    },
    async login(payload: { username: string; password: string }) {
        setStatus("pending");
        const { sessionId } = await api.login(payload);
        setPersistentHeader("Authorization", `Bearer ${sessionId}`);
        await this.authenticate();
    },
    get status() {
        return status();
    },
};

export default auth;
