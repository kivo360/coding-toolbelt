const isTTY = process.stdout.isTTY;
const NO_COLOR = process.env.NO_COLOR === "1" || process.env.NO_COLOR === "true";
const colorOn = isTTY && !NO_COLOR;

function code(open: number, close: number) {
  return (s: string) => (colorOn ? `\x1b[${open}m${s}\x1b[${close}m` : s);
}

export const c = {
  bold: code(1, 22),
  dim: code(2, 22),
  red: code(31, 39),
  green: code(32, 39),
  yellow: code(33, 39),
  blue: code(34, 39),
  magenta: code(35, 39),
  cyan: code(36, 39),
  gray: code(90, 39),
};

export function print(s: string = ""): void {
  process.stdout.write(s + "\n");
}

export function printErr(s: string): void {
  process.stderr.write(s + "\n");
}

export function table(rows: string[][], opts: { header?: string[]; gap?: number } = {}): void {
  const gap = opts.gap ?? 2;
  const all = opts.header ? [opts.header, ...rows] : rows;
  if (all.length === 0) return;
  const cols = all[0].length;
  const widths: number[] = [];
  for (let col = 0; col < cols; col++) {
    widths[col] = Math.max(...all.map((r) => stripAnsi(r[col] ?? "").length));
  }
  if (opts.header) {
    print(opts.header.map((h, i) => c.bold(h.padEnd(widths[i]))).join(" ".repeat(gap)));
    print(widths.map((w) => "─".repeat(w)).join(" ".repeat(gap)));
  }
  for (const row of rows) {
    print(
      row
        .map((cell, i) => {
          const visual = stripAnsi(cell);
          return cell + " ".repeat(Math.max(0, widths[i] - visual.length));
        })
        .join(" ".repeat(gap))
    );
  }
}

function stripAnsi(s: string): string {
  return s.replace(/\x1b\[[0-9;]*m/g, "");
}
