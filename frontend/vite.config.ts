import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
    plugins: [
        react({
            babel: {
                plugins: [
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
            authContext: "/src/libs/authContext",
            views: "/src/libs/views",
            store: "/src/libs/store",
            util: "/src/libs/util",
            api: "/src/libs/api",
            ui: "/src/libs/ui",
            theme: "/src/libs/theme",
            withConfirm: "/src/libs/withConfirm",
            local: "/src/libs/local",
            withMenu: "/src/libs/withMenu",
            sleep: "/src/libs/sleep",
            withModal: "/src/libs/withModal",
            zIndexes: "/src/libs/zIndexes",
            withStatus: "/src/libs/withStatus",
            ellipsify: "/src/libs/ellipsify",
            assert: "/src/libs/assert",
        },
    },
    server: {
        host: true,
        port: 8080,
    },
});
