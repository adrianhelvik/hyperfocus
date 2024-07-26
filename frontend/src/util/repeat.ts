export default function repeat<T>(count: number, callback: (i: number) => T): T[] {
  const result = new Array(count);
  for (let i = 0; i < count; i++) {
    result[i] = callback(i);
  }
  return result;
}
