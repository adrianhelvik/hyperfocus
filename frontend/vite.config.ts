import solid from "vite-plugin-solid";
import { defineConfig } from "vite";
import { fileURLToPath } from "url";
import path from "path";
import fs from "fs";

const dirname = path.dirname(fileURLToPath(import.meta.url));
console.log(dirname);
const libsFolder = path.resolve(dirname, "src/libs");

const alias: any = {};

for (const f of fs.readdirSync(libsFolder)) {
    alias[f] = `/src/libs/${f}`;
    const extname = path.extname(f);
    if ([".js", ".ts", ".tsx"].includes(extname)) {
        const extless = f.slice(0, f.length - extname.length);
        alias[extless] = `/src/libs/${extless}`;
    }
}

export default defineConfig({
    plugins: [solid()],
    resolve: {
        alias,
    },
    server: {
        host: true,
        port: 8080,
    },
});
