import { PORT, SERVER_URL } from "./env";
import { beginProfiling } from "./profiling";
import { server, warmUp } from "./server";

console.log("Starting...");

server.listen(PORT, async () => {
    await warmUp();

    console.log(`Listening on ${SERVER_URL}`);

    beginProfiling();
});
