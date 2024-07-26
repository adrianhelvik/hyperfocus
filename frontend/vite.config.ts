import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import picocolors from "picocolors";

declare global {
    const process: {
        env: Record<string, string>;
    }
}

const API_URL = process.env.API_URL || "https://hyperfocus.live";

console.log();
console.log(picocolors.bold(`API_URL=${API_URL}`));
console.log();

export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: [
                    "styled-components",
                    [
                        "@babel/plugin-transform-typescript",
                        {
                            allowDeclareFields: true,
                            isTSX: true,
                        },
                    ],
                    [
                        "@babel/plugin-proposal-decorators",
                        {
                            version: "legacy",
                        },
                    ],
                    [
                        "@babel/plugin-proposal-class-properties",
                        { loose: true },
                    ],
                    "babel-plugin-macros",
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            src: "/src",
        },
    },
    server: {
        host: "0.0.0.0",
        port: 9341,
        proxy: {
            "/api": {
                target: API_URL,
                rewrite(path: string) {
                    if (process.env.REWRITE === "true") {
                        //
                        // Since the first slash adds a leading empty string,
                        // I strip the first two items.
                        //
                        //     /api/...
                        //
                        // is split into
                        //
                        //     ["", "api", ...]
                        //
                        const rewritten = "/" + path.split("/").slice(2).join("/");
                        return rewritten;
                    }
                    return path
                },
                changeOrigin: true,
                secure: false,
            },
            "/socket.io": {
                target: API_URL,
                changeOrigin: true,
                secure: false,
            }
        },
    },
});
