const BACKGROUND = '#10183a';
const TOKEN_COLORS = ['#ffd23f', '#43d17a', '#5af0ff', '#ff5ac8', '#fff8e7', '#9fd8ff'];

/** Pixels from one line of code to the next (1px of text, 1px gap). */
const LINE_PITCH = 2;

type Line = readonly { readonly x: number; readonly width: number; readonly color: string }[];

/**
 * A tiny canvas of colourful "code" lines that scroll up one pixel per `step()`, used as the
 * monitor's texture. Sized close to the screen's on-screen pixel size so it stays crisp.
 */
export class CodeScreen {
  readonly canvas: HTMLCanvasElement;
  private readonly context: CanvasRenderingContext2D;
  private readonly lines: Line[] = [];
  private offset = 0;
  private seed = 11;
  private indent = 0;

  constructor(
    readonly width = 20,
    readonly height = 14,
  ) {
    this.canvas = document.createElement('canvas');
    this.canvas.width = width;
    this.canvas.height = height;
    this.context = this.canvas.getContext('2d')!;

    for (let i = 0; i <= Math.ceil(height / LINE_PITCH); i++) {
      this.lines.push(this.nextLine());
    }

    this.draw();
  }

  /** Scrolls the code up by one pixel and redraws. */
  step(): void {
    this.offset++;

    if (this.offset >= LINE_PITCH) {
      this.offset = 0;
      this.lines.shift();
      this.lines.push(this.nextLine());
    }

    this.draw();
  }

  private draw(): void {
    const { context } = this;

    context.fillStyle = BACKGROUND;
    context.fillRect(0, 0, this.width, this.height);

    this.lines.forEach((line, row) => {
      const y = 1 + row * LINE_PITCH - this.offset;

      for (const token of line) {
        context.fillStyle = token.color;
        context.fillRect(token.x, y, token.width, 1);
      }
    });
  }

  /** A random-looking line: indented like a code block, 1–3 coloured tokens, sometimes blank. */
  private nextLine(): Line {
    const roll = this.random();

    if (roll < 0.12) {
      return [];
    }

    this.indent = Math.max(0, Math.min(3, this.indent + (roll < 0.35 ? 1 : roll > 0.8 ? -1 : 0)));

    const line: { x: number; width: number; color: string }[] = [];
    let x = 1 + this.indent * 2;
    const tokens = 1 + Math.floor(this.random() * 3);

    for (let i = 0; i < tokens && x < this.width - 2; i++) {
      const width = Math.min(2 + Math.floor(this.random() * 5), this.width - 1 - x);
      line.push({ x, width, color: TOKEN_COLORS[Math.floor(this.random() * TOKEN_COLORS.length)] });
      x += width + 1;
    }

    return line;
  }

  private random(): number {
    this.seed = (this.seed * 16807) % 2147483647;
    return this.seed / 2147483647;
  }
}
