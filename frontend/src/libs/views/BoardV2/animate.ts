export default async function animate(opts: { values: Record<string, [number, number]>, time: number, fn: (values: Record<string, number>) => void }) {
    return new Promise(resolve => {
        const start = Date.now();
        let af: ReturnType<typeof requestAnimationFrame>;
        let progress = 0;

        const updatedValues: Record<string, number> = {};
        update();

        const loop = () => {
            const now = Date.now();
            progress = Math.min((now - start) / opts.time, 1);
            update();
            opts.fn(updatedValues);
            if (progress >= 1) {
                resolve(null);
            } else {
                af = requestAnimationFrame(loop);
            }
        };

        af = requestAnimationFrame(loop);

        function update() {
            for (const [key, [init, final]] of Object.entries(opts.values)) {
                updatedValues[key] = init * (1 - progress) + final * progress;
            }
        }
    });
}
