// Lightweight visual QR placeholder (deterministic pattern from a seed).
// For UI demonstration only — not a real QR encoder.
export function QRCode({ value, size = 180 }: { value: string; size?: number }) {
  const grid = 21;
  let h = 0;
  for (let i = 0; i < value.length; i++) h = (h * 31 + value.charCodeAt(i)) >>> 0;
  const cells: boolean[] = [];
  for (let i = 0; i < grid * grid; i++) {
    h = (h * 1103515245 + 12345) >>> 0;
    cells.push((h & 1) === 1);
  }
  // Place finder patterns
  const isFinder = (x: number, y: number) => {
    const f = (cx: number, cy: number) =>
      x >= cx && x < cx + 7 && y >= cy && y < cy + 7;
    return f(0, 0) || f(grid - 7, 0) || f(0, grid - 7);
  };
  const finderOn = (x: number, y: number) => {
    const within = (cx: number, cy: number) => {
      const rx = x - cx, ry = y - cy;
      if (rx < 0 || ry < 0 || rx > 6 || ry > 6) return null;
      const edge = rx === 0 || ry === 0 || rx === 6 || ry === 6;
      const center = rx >= 2 && rx <= 4 && ry >= 2 && ry <= 4;
      return edge || center;
    };
    return within(0, 0) ?? within(grid - 7, 0) ?? within(0, grid - 7) ?? false;
  };
  const cell = size / grid;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className="rounded-md bg-white">
      <rect width={size} height={size} fill="#ffffff" />
      {cells.map((on, i) => {
        const x = i % grid;
        const y = Math.floor(i / grid);
        const filled = isFinder(x, y) ? finderOn(x, y) : on;
        if (!filled) return null;
        return <rect key={i} x={x * cell} y={y * cell} width={cell} height={cell} fill="#0F172A" />;
      })}
    </svg>
  );
}
