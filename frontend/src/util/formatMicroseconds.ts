export default function formatMicroseconds(micro: number) {
  if (micro < 1000) return `${micro | 0}µs`;
  const milli = micro / 1000;
  if (milli < 1000) return `${milli | 0}ms`;
  const seconds = milli / 1000;
  return `${seconds | 0}s`;
}
