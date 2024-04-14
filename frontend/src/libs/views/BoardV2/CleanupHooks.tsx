export class CleanupHooks {
    private fns: Array<() => void> = [];

    run() {
        for (const fn of this.fns) {
            fn();
        }
        this.fns = [];
    }

    add(fn: () => void) {
        this.fns.push(fn);
    }
}
