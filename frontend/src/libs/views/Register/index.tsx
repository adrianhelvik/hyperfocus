import styles from "./styles.module.css";
import { createSignal } from "solid-js";
import Button from "ui/Button";
import Input from "ui/Input";
import api from "api";

export default function Register() {
    const [repeatedPassword, setRepeatedPassword] = createSignal("");
    const [password, setPassword] = createSignal("");
    const [email, setEmail] = createSignal("");

    const onSubmit = async (event: SubmitEvent) => {
        event.preventDefault();

        console.log(password(), repeatedPassword());

        if (password() !== repeatedPassword())
            return alert("The passwords do not match");

        try {
            await api.registerUser({
                password: password(),
                email: email(),
            });
            window.location.href = "/login";
        } catch (e: any) {
            console.error(e);
            alert(e.message);
        }
    };

    return (
        <form class={styles.container} onSubmit={onSubmit}>
            <div class={styles.innerContainer}>
                <Input
                    placeholder="Email"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                />
                <Input
                    type="password"
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                />
                <Input
                    type="password"
                    placeholder="Repeat password"
                    onChange={(e) => setRepeatedPassword(e.target.value)}
                    value={repeatedPassword}
                />
                <Button type="submit">Create user</Button>
            </div>
        </form>
    );
}
