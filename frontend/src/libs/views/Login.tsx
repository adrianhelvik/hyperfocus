import { createEffect, createSignal } from "solid-js";
import styles from "./Login.module.css";
import Button from "ui/Button";
import Input from "ui/Input";
import sleep from "sleep";
import auth from "auth";

export default function Login() {
    const [username, setUsername] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [message, setMessage] = createSignal("");
    const [error, setError] = createSignal("");

    createEffect(() => {
        console.log("error:", error());
    });

    const onSubmit = async (event: SubmitEvent) => {
        event.preventDefault();
        setError("");
        setMessage("Logging in...");

        await sleep(500);

        await auth
            .login({
                username: username(),
                password: password(),
            })
            .catch((e: Error) => {
                setError(e.message);
                setMessage("");
            });
    };

    createEffect(() => {
        auth.authenticate();
    });

    createEffect(() => {
        if (auth.status === "success") {
            window.location.href = "/app";
        }
    });

    return (
        <div class={styles.container}>
            <form class={styles.form} onSubmit={onSubmit}>
                <Input
                    placeholder="Username"
                    onChange={(e) => setUsername(e.target.value)}
                    value={username()}
                />
                <Input
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password()}
                    type="password"
                />
                <Button>Log in</Button>
                <div class={styles.message}>
                    {message()}
                    {error() && (
                        <>
                            <strong>An error occurred</strong>
                            {error()}
                        </>
                    )}
                </div>
            </form>
        </div>
    );
}
