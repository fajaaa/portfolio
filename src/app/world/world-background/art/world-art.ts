import { ChangeDetectionStrategy, Component } from '@angular/core';

/**
 * Per-world pixel-art layers (2–3 each), drawn in their stylesheets with pixel-svg tiles.
 * `data-parallax` = yPercent the layer drifts by (animated by WorldBackgroundComponent).
 */

@Component({
  selector: 'app-sky-art',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="layer layer--clouds-far" data-parallax="4"><div class="drift drift--slow"></div></div>
    <div class="layer layer--clouds-near" data-parallax="7"><div class="drift"></div></div>
    <div class="layer layer--grass"></div>
  `,
  styleUrl: './sky-art.scss',
})
export class SkyArtComponent {}

@Component({
  selector: 'app-forest-art',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="layer layer--trees-far" data-parallax="5"></div>
    <div class="layer layer--trees-near"></div>
    <div class="layer layer--fireflies" data-parallax="6">
      @for (firefly of fireflies; track $index) {
        <span
          class="firefly"
          [style.left.%]="firefly.x"
          [style.top.%]="firefly.y"
          [style.animation-delay.s]="firefly.delay"
        ></span>
      }
    </div>
  `,
  styleUrl: './forest-art.scss',
})
export class ForestArtComponent {
  protected readonly fireflies = [
    { x: 6, y: 18, delay: 0 },
    { x: 18, y: 42, delay: -1.2 },
    { x: 31, y: 12, delay: -2.6 },
    { x: 47, y: 30, delay: -0.7 },
    { x: 62, y: 16, delay: -3.1 },
    { x: 74, y: 46, delay: -1.8 },
    { x: 86, y: 24, delay: -4 },
    { x: 94, y: 54, delay: -2.2 },
  ];
}

@Component({
  selector: 'app-cave-art',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="layer layer--bricks" data-parallax="3"></div>
    <div class="layer layer--crystals" data-parallax="6">
      @for (crystal of crystals; track $index) {
        <span
          class="crystal"
          [class.crystal--cyan]="crystal.cyan"
          [style.left.%]="crystal.x"
          [style.top.%]="crystal.y"
          [style.--glow-delay]="crystal.delay + 's'"
        ></span>
      }
    </div>
  `,
  styleUrl: './cave-art.scss',
})
export class CaveArtComponent {
  protected readonly crystals = [
    { x: 3, y: 14, cyan: false, delay: 0 },
    { x: 92, y: 22, cyan: true, delay: -1.1 },
    { x: 8, y: 58, cyan: true, delay: -2.3 },
    { x: 95, y: 64, cyan: false, delay: -0.6 },
    { x: 2, y: 86, cyan: false, delay: -1.7 },
    { x: 88, y: 88, cyan: true, delay: -2.9 },
  ];
}

@Component({
  selector: 'app-water-art',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="layer layer--bubbles" data-parallax="5">
      @for (bubble of bubbles; track $index) {
        <span
          class="bubble"
          [style.left.%]="bubble.x"
          [style.animation-duration.s]="bubble.duration"
          [style.animation-delay.s]="bubble.delay"
        ></span>
      }
    </div>
    <div class="layer layer--sand"></div>
  `,
  styleUrl: './water-art.scss',
})
export class WaterArtComponent {
  protected readonly bubbles = [
    { x: 4, duration: 14, delay: 0 },
    { x: 13, duration: 18, delay: -6 },
    { x: 27, duration: 16, delay: -11 },
    { x: 44, duration: 20, delay: -3 },
    { x: 58, duration: 15, delay: -9 },
    { x: 71, duration: 19, delay: -14 },
    { x: 84, duration: 13, delay: -5 },
    { x: 95, duration: 17, delay: -12 },
  ];
}

@Component({
  selector: 'app-castle-art',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="layer layer--stars" data-parallax="4"></div>
    <div class="layer layer--castle"><div class="torches"></div></div>
  `,
  styleUrl: './castle-art.scss',
})
export class CastleArtComponent {}
