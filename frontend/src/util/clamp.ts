export default function clamp(value: number, low: number, high: number) {
  if (value < low) return low;
  if (value > high) return high;
  return value;
}
