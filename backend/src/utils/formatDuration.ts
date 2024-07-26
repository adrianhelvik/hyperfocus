export default function formatDuration(nanoSeconds: bigint) {
  const micro = nanoSeconds / 1000n;
  if (micro < 1000) return `${micro | 0n}µs`;
  const milli = micro / 1000n;
  if (milli < 1000) return `${milli | 0n}ms`;
  const seconds = milli / 1000n;
  return `${seconds | 0n}s`;
}
