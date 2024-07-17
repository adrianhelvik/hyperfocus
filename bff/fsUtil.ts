import path from "path";
import fs from "fs";

export function* scan(dir: string): Iterable<string> {
    for (const file of fs.readdirSync(dir)) {
        const absFile = path.resolve(dir, file);
        const stat = fs.statSync(absFile);
        if (stat.isDirectory()) {
            yield* scan(absFile);
        } else {
            yield absFile;
        }
    }
}
