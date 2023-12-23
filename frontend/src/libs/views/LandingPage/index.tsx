import styles from "./styles.module.css";
import { createEffect } from "solid-js";
import Header from "ui/Header";

export default function LandingPage() {
    createEffect(() => {
        (window as any).particlesJS.load(
            "particles-js",
            "particles.json",
            () => {
                console.log("callback - particles.js config loaded");
            },
        );
    });

    return (
        <>
            <div class={styles.particles} id="particles-js" />
            <Header />
            <section class={styles.section}>
                <div class={styles.content}>
                    <h1 class={styles.title}>
                        <strong>Open source</strong> kanban boards with{" "}
                        <strong>portals</strong>
                    </h1>
                    <a class={styles.register} href="/register">Register</a>
                    <div class={styles.loginWrapper}>
                        Or <a class={styles.login} href="/login">log in</a>
                    </div>
                    <div class={styles.loginWrapper}>
                        Or check out on{" "}
                        <a
                            href="https://github.com/adrianhelvik/subtask"
                            class={styles.githubLink}
                        >
                            GitHub
                        </a>
                    </div>
                </div>
            </section>
        </>
    );
}
