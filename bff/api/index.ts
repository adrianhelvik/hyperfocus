import http from "http";
import { LOG_REQUESTS } from "../env";

export default function api(req: http.IncomingMessage, res: http.ServerResponse<http.IncomingMessage>) {
    if (LOG_REQUESTS) {
        console.log("API request:", req.method, req.url);
    }
}
