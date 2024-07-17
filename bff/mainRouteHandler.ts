import path from "path";
import http from "http";
import { LOG_REQUESTS } from "./env";
import { warmupComplete } from "./server";
import { profileRequest } from "./profiling";
import { noCache, pipeFile, sendWithMime } from "./httpUtil";
import api from "./api";
import { distDir } from "./paths";

function logRequest(req: http.IncomingMessage) {
    if (LOG_REQUESTS && warmupComplete) {
        console.log();
        console.log(`${req.method} ${req.url}`);
    }
}

export const mainRouteHandler = (
    req: http.IncomingMessage,
    res: http.ServerResponse<http.IncomingMessage>
) => {
    if (!req.url) {
        res.statusCode = 404;
        res.end("Not found");
        return;
    }

    logRequest(req);

    profileRequest(res);

    const url = req.url.replace(/\/+$/, "") || "/";
    const extname = path.extname(url);

    if (url.startsWith("/api/")) {
        noCache(res);
        return api(req, res);
    }

    switch (extname) {
        case "":
            return sendIndex(res);
        case ".ico":
            return sendWithMime("image/x-icon", url, res);
        case ".html":
            return sendWithMime("text/html", url, res);
        case ".css":
            return sendWithMime("text/css", url, res);
        case ".js":
            return sendWithMime("application/javascript", url, res);
        case ".json":
            return sendWithMime("application/json", url, res);
        default:
            res.statusCode = 500;
            res.end("Unknown file type");
    }
};

async function sendIndex(res: http.ServerResponse<http.IncomingMessage>) {
    noCache(res);

    res.setHeader("Content-Type", "text/html");
    pipeFile(res, path.resolve(distDir, "index.html"));
}
