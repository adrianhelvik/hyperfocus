import http from "http";
import fs from "fs";
import { mainRouteHandler } from "./mainRouteHandler";
import { PRELOAD_FILES, SERVER_URL } from "./env";
import { scan } from "./fsUtil";
import { distDir } from "./paths";

export let warmupComplete = false;

export const server = http.createServer(mainRouteHandler);
export let fileCache: Map<string, string> | null;

export async function warmUp() {
    const runs = 10;
    for (let i = 0; i < runs; i++) {
        await makeRequest("");
        await makeRequest("/");
        for (const fileName of fileCache ? fileCache.keys() : scan(distDir)) {
            const url = fileName.replace(distDir, "");
            await makeRequest(url);
        }
        if ((i + 1) % 1000 === 0) {
            console.log(`Warmup run ${i + 1}/${runs} complete`);
        }
    }

    console.log("Warm up complete");
}

async function makeRequest(url: string) {
    await new Promise<void>((resolve, reject) => {
        http.get(SERVER_URL + url, (res => {
            res
                .on("data", () => {
                })
                .on("end", () => {
                    resolve();
                })
                .on("error", () => {
                    reject();
                });
        }));
    });
}

export function preloadFiles() {
    if (!PRELOAD_FILES) return;
    fileCache = new Map<string, string>();
    for (const file of scan(distDir)) {
        fileCache.set(file, fs.readFileSync(file, "utf8"));
    }
    console.log("Preloaded frontend source files");
}
