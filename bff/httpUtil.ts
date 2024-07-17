import http from "http";
import fs from "fs";
import path from "path";
import { distDir } from "./paths";
import { fileCache } from "./server";

const SAFE_FILE_PATH = /^\/([a-zA-Z0-9-_]{1,50}\/){0,10}[a-zA-Z0-9_-]{1,50}(\.?[a-zA-Z0-9-_]{1,50}){1,5}$/;

export function noCache(res: http.ServerResponse<http.IncomingMessage>) {
    res.setHeader("Cache-Control", "nocache");
    res.setHeader("Cache-Control", ["no-cache", "no-store", "must-revalidate"])
    res.setHeader("Pragma", "no-cache");
    res.setHeader("Expires", 0);
}

export function sendWithMime(
    mime: string,
    url: string,
    res: http.ServerResponse<http.IncomingMessage>,
) {
    if (!SAFE_FILE_PATH.test(url)) {
        console.debug(`Invalid file path: ${url}`);
        res.statusCode = 400;
        res.end("Invalid path");
        return;
    }

    const cacheable = /-[a-zA-Z0-9]\.(js|css)/.test(url);
    if (!cacheable) noCache(res);

    const safeFilePath = path.resolve(distDir, url.substring(1));

    res.setHeader("Content-Type", mime);
    pipeFile(res, safeFilePath);
}

export function pipeFile(res: http.ServerResponse<http.IncomingMessage>, fileName: string) {
    if (fileCache) {
        // console.log("Serving file from in-memory cache:", fileName);
        if (!fileCache.has(fileName)) {
            res.statusCode = 404;
            return res.write("Not found");
        }
        return res.end(fileCache.get(fileName));
    }

    try {
        fs
            .createReadStream(fileName)
            .on("error", error => {
                console.error(`Failed to read: ${fileName}`);
                console.error(error.message);
                res.statusCode = 404;
                res.write("Not found");
            })
            .pipe(res);
    } catch (e: any) {
        console.error(`Failed to read: ${fileName}`);
        console.error(e.message);
        res.statusCode = 404;
        res.write("Not found");
    }
}
