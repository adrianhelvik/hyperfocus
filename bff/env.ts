export const PRELOAD_FILES = process.env.PRELOAD_FILES === "true";
export const PROFILING = process.env.PROFILING === "true";
export const LOG_REQUESTS = process.env.LOG_REQUESTS === "true";
export const PORT = process.env.PORT || 12933;
export const SERVER_URL = `http://127.0.0.1:${PORT}`;
