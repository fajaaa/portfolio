import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * A string-map sprite: one string per row, one character per pixel. `palette` maps characters
 * to CSS colors (CSS variables and `currentColor` work); other characters are transparent.
 */
export interface PixelSprite {
  readonly rows: readonly string[];
  readonly palette: Readonly<Record<string, string>>;
}

interface ColorPath {
  readonly fill: string;
  /** One `M x y h w v1 h-w z` rectangle per horizontal run of the color. */
  readonly d: string;
}

/**
 * Renders a `PixelSprite` as a crisp inline SVG with one path per color, so even big sprites
 * stay a handful of DOM nodes. OnPush: it only re-renders when `sprite` changes, which keeps
 * the page's many sprites out of every change detection pass.
 * Decorative: hidden from screen readers. Size it from the outside with width/height.
 */
@Component({
  selector: 'app-pixel-art',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg
      [attr.viewBox]="viewBox()"
      shape-rendering="crispEdges"
      preserveAspectRatio="xMidYMid meet"
      aria-hidden="true"
      focusable="false"
    >
      @for (path of paths(); track path.fill) {
        <path [attr.d]="path.d" [style.fill]="path.fill" />
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

  protected readonly paths = computed((): ColorPath[] => {
    const { rows, palette } = this.sprite();
    const byColor = new Map<string, string>();

    rows.forEach((row, y) => {
      for (let x = 0; x < row.length; ) {
        const char = row[x];
        let width = 1;

        while (row[x + width] === char) {
          width++;
        }

        const fill = palette[char];

        if (fill) {
          byColor.set(fill, `${byColor.get(fill) ?? ''}M${x} ${y}h${width}v1h-${width}z`);
        }

        x += width;
      }
    });

    return Array.from(byColor, ([fill, d]) => ({ fill, d }));
  });
}
