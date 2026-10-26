import { Component, computed, input } from '@angular/core';

/**
 * A string-map sprite: one string per row, one character per pixel. `palette` maps characters
 * to CSS colors (CSS variables and `currentColor` work); other characters are transparent.
 */
export interface PixelSprite {
  readonly rows: readonly string[];
  readonly palette: Readonly<Record<string, string>>;
}

interface Run {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly fill: string;
}

/**
 * Renders a `PixelSprite` as a crisp inline SVG (one rect per horizontal run of a color).
 * Decorative: hidden from screen readers. Size it from the outside with width/height.
 */
@Component({
  selector: 'app-pixel-art',
  template: `
    <svg
      [attr.viewBox]="viewBox()"
      shape-rendering="crispEdges"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      @for (run of runs(); track $index) {
        <rect [attr.x]="run.x" [attr.y]="run.y" [attr.width]="run.width" height="1" [style.fill]="run.fill" />
      }
    </svg>
  `,
  styles: `
    :host {
      display: inline-block;
      flex: none;
      line-height: 0;
    }

    svg {
      width: 100%;
      height: 100%;
      overflow: visible;
    }
  `,
})
export class PixelArtComponent {
  readonly sprite = input.required<PixelSprite>();

  protected readonly viewBox = computed(() => {
    const { rows } = this.sprite();
    return `0 0 ${Math.max(...rows.map((row) => row.length))} ${rows.length}`;
  });

  protected readonly runs = computed(() => {
    const { rows, palette } = this.sprite();
    const runs: Run[] = [];

    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; ) {
        const char = row[x];
        let width = 1;

        while (row[x + width] === char) {
          width++;
        }

        if (palette[char]) {
          runs.push({ x, y, width, fill: palette[char] });
        }

        x += width;
      }
    });

    return runs;
  });
}
