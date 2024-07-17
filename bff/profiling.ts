import http from "http";
import { PROFILING } from "./env";

let requestTimes: Array<bigint> | null;

const REQUEST_TIME_ENTRIES = 50;
let firstResponseTime: bigint | null = null;
let latestResponseTime: bigint | null = null;
let requestTimeIndex = 0;
let requestTimesFull = false;

export function beginProfiling() {
    if (!PROFILING) return;

    requestTimes = new Array(REQUEST_TIME_ENTRIES);
    const times = requestTimes;

    setInterval(() => {
        if (requestTimes === null) return;

        const endIndex = requestTimesFull ? REQUEST_TIME_ENTRIES : requestTimeIndex;
        if (latestResponseTime === null) return;
        if (firstResponseTime === null) return;
        if (endIndex === 0) return;

        let sum = 0n;
        for (let i = 0; i < endIndex; i++) {
            sum += times[i];
        }
        const average = (sum / BigInt(endIndex));

        const medianArray = requestTimes.slice(0, endIndex).sort((a, b) => Number(a - b));
        const median = medianArray[(medianArray.length / 2) | 0];

        console.log();
        console.log(`First response time:       ${firstResponseTime / 1000n}µs`);
        console.log(`Latest response time:      ${latestResponseTime / 1000n}µs`);
        console.log(`Average response time:     ${average / 1000n}µs`);
        console.log(`Median response time:      ${median}`);
        console.log(`Requests in current batch: ${requestTimeIndex}`);
    }, 1000);
}


export function profileRequest(res: http.ServerResponse<http.IncomingMessage>) {
    if (!requestTimes) return

    console.log("PROFILING REQUEST");
    const times = requestTimes;
    const start = process.hrtime.bigint();
    res.on("finish", () => {
        if (res.statusCode !== 200) return;
        const end = process.hrtime.bigint();
        times[requestTimeIndex] = end - start;
        requestTimeIndex += 1;
        if (requestTimeIndex > REQUEST_TIME_ENTRIES) {
            requestTimeIndex = 0;
            requestTimesFull = true;
        }
        if (firstResponseTime === null) {
            firstResponseTime = end - start;
        }
        latestResponseTime = end - start;
    });
}

