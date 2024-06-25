type Pos = {
  x: number;
  y: number;
};

export function distanceBetween(a: Pos, b: Pos) {
  return Math.sqrt((b.x - a.x) ** 2 + (b.y - a.y) ** 2);
}
