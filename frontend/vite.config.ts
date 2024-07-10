import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

declare global {
    const process: {
        env: Record<string, string>;
    }
}

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
                target: process.env.API_URL || "https://hyperfocus.live",
                rewrite(path: string) {
                    console.log("path: " + path);
                    if (process.env.REWRITE === "true") {
                        const rewritten = "/" + path.split("/").slice(2).join("/");
                        console.log("rewritten: " + rewritten);
                        return rewritten;
                    }
                    return path
                },
                changeOrigin: true,
                secure: false,
            },
        },
    },
});
