import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

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
                ],
            },
        }),
    ],
    resolve: {
        alias: {
            src: "/src",
            assert: "/src/libs/assert",
        },
    },
    server: {
        host: "0.0.0.0",
        port: 9341,
    },
});
