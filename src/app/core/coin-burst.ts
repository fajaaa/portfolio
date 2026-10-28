/** A one-off burst of pixel coins from the middle of the screen, on its own short-lived canvas. */

const COUNT = 40;
const DURATION_MS = 1500;
const FADE_MS = 300;
const GRAVITY = 1400; // px/s²

// Spinning coin: front, three-quarter and edge frames (8 px tall).
const FRAMES: readonly (readonly string[])[] = [
  ['..XXXX..', '.XYYYYX.', 'XYYOYYOX', 'XYYOYYOX', 'XYYOYYOX', 'XYYOYYOX', '.XOYYOX.', '..XXXX..'],
  ['.XXX.', 'XYYYX', 'XYOYX', 'XYOYX', 'XYOYX', 'XYOYX', 'XOYOX', '.XXX.'],
  ['XX', 'XO', 'XO', 'XO', 'XO', 'XO', 'XO', 'XX'],
];
const COLORS: Readonly<Record<string, string>> = { X: '#0b0b14', Y: '#ffd23f', O: '#e0a020' };

interface Coin {
  x: number;
  y: number;
  vx: number;
  vy: number;
  /** Frames per second of the spin. */
  spin: number;
  phase: number;
}

/** Starts the burst and resolves once its canvas is gone. Call outside the Angular zone. */
export function coinBurst(): Promise<void> {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');

  if (!context) {
    return Promise.resolve();
  }

  const width = window.innerWidth;
  const height = window.innerHeight;
  const scale = width < 480 ? 3 : 4;

  canvas.width = width;
  canvas.height = height;
  canvas.setAttribute('aria-hidden', 'true');
  Object.assign(canvas.style, {
    position: 'fixed',
    inset: '0',
    width: `${width}px`,
    height: `${height}px`,
    zIndex: '1250',
    pointerEvents: 'none',
  });
  document.body.append(canvas);
  context.imageSmoothingEnabled = false;

  const coins: Coin[] = Array.from({ length: COUNT }, () => {
    // Mostly upwards, fanning out to both sides.
    const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 0.9;
    const speed = 420 + Math.random() * 520;

    return {
      x: width / 2,
      y: height / 2,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      spin: 8 + Math.random() * 8,
      phase: Math.random() * 4,
    };
  });

  return new Promise((resolve) => {
    const start = performance.now();
    let last = start;

    const draw = (now: number) => {
      const elapsed = now - start;
      const dt = Math.min((now - last) / 1000, 1 / 20);
      last = now;

      context.clearRect(0, 0, width, height);
      // Stepped fade-out over the last 300 ms.
      const fade = Math.max(0, elapsed - (DURATION_MS - FADE_MS)) / FADE_MS;
      context.globalAlpha = 1 - Math.ceil(fade * 3) / 3;

      coins.forEach((coin) => {
        coin.vy += GRAVITY * dt;
        coin.x += coin.vx * dt;
        coin.y += coin.vy * dt;
        // Front, three-quarter, edge, three-quarter...
        const step = Math.floor(coin.phase + (elapsed / 1000) * coin.spin) % 4;
        drawFrame(context, FRAMES[step === 3 ? 1 : step], coin.x, coin.y, scale);
      });

      if (elapsed < DURATION_MS) {
        requestAnimationFrame(draw);
      } else {
        canvas.remove();
        resolve();
      }
    };

    requestAnimationFrame(draw);
  });
}

function drawFrame(
  context: CanvasRenderingContext2D,
  rows: readonly string[],
  x: number,
  y: number,
  scale: number,
): void {
  const left = Math.round(x - (rows[0].length * scale) / 2);
  const top = Math.round(y - (rows.length * scale) / 2);

  rows.forEach((row, rowIndex) => {
    for (let column = 0; column < row.length; column++) {
      const color = COLORS[row[column]];

      if (color) {
        context.fillStyle = color;
        context.fillRect(left + column * scale, top + rowIndex * scale, scale, scale);
      }
    }
  });
}
