import {
  Component,
  DestroyRef,
  ElementRef,
  NgZone,
  afterNextRender,
  computed,
  effect,
  inject,
  isDevMode,
  signal,
  untracked,
  viewChild,
} from '@angular/core';

import { I18nService } from '../../core/i18n.service';
import { MotionService } from '../../core/motion.service';
import { TranslatePipe } from '../../i18n/translate.pipe';
import type { VoxelScene } from '../voxel/voxel-scene';
import { IslandSprite, createIslandSprite } from '../voxel/island-sprite';

type StageState = 'loading' | 'ready' | 'fallback';

const GREETING_MS = 2800;

let sprite: IslandSprite | undefined;

/**
 * The hero's voxel island. Shows a pixel SVG of the island right away, lazy-loads the three.js
 * scene (and three itself) once the page has painted, and swaps to the canvas on its first
 * frame. The SVG stays as the fallback when WebGL is unavailable or fails.
 *
 * The loop runs only while the stage is on screen and the tab is visible. A mouse anywhere on
 * the page turns the island towards it; on touch, dragging over it does. Clicking Kenan makes
 * him hop and say hi in a speech bubble that follows his head.
 */
@Component({
  selector: 'app-hero-stage',
  imports: [TranslatePipe],
  templateUrl: './hero-stage.component.html',
  styleUrl: './hero-stage.component.scss',
})
export class HeroStageComponent {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly zone = inject(NgZone);
  private readonly i18n = inject(I18nService);
  private readonly motion = inject(MotionService);
  private readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('canvas');

  protected readonly sprite = (sprite ??= createIslandSprite());
  protected readonly state = signal<StageState>('loading');

  /** Which greeting the bubble shows; null while it's closed. */
  private readonly greetingIndex = signal<number | null>(null);
  protected readonly greeting = computed(() => {
    const index = this.greetingIndex();
    const greetings = this.i18n.list('hero.greetings');

    return index === null ? '' : greetings[index % greetings.length];
  });

  private scene: VoxelScene | undefined;
  private destroyed = false;
  private onScreen = false;
  private greetingCount = 0;
  private cancelLoad: (() => void) | undefined;
  private greetingTimer: ReturnType<typeof setTimeout> | undefined;
  private observers: { disconnect(): void }[] = [];
  private removeListeners: (() => void)[] = [];
  private pointer = { x: 0, y: 0 };
  private drag: { id: number; x: number; y: number; from: { x: number; y: number } } | undefined;

  constructor() {
    afterNextRender(() => {
      this.zone.runOutsideAngular(() => {
        // Wait until the browser is idle after first paint, so three.js never delays it.
        const load = () => void this.load();

        if ('requestIdleCallback' in window) {
          const handle = requestIdleCallback(load, { timeout: 1500 });
          this.cancelLoad = () => cancelIdleCallback(handle);
        } else {
          const handle = setTimeout(load, 300);
          this.cancelLoad = () => clearTimeout(handle);
        }
      });
    });

    effect(() => {
      const reduced = this.motion.reducedMotion();

      untracked(() => {
        this.scene?.setReducedMotion(reduced);
        this.updateLoop();
      });
    });

    inject(DestroyRef).onDestroy(() => this.teardown());
  }

  private async load(): Promise<void> {
    let module: typeof import('../voxel/voxel-scene');

    try {
      module = await import('../voxel/voxel-scene');
    } catch {
      this.fail();
      return;
    }

    const canvas = this.canvas()?.nativeElement;

    if (this.destroyed || !canvas) {
      return;
    }

    const scene = new module.VoxelScene();

    try {
      scene.init(canvas, {
        reducedMotion: this.motion.reducedMotion(),
        onFirstFrame: () => this.zone.run(() => this.state.set('ready')),
        onFrame: () => this.moveBubble(),
        onCharacterClick: () => this.greet(),
        onContextLost: () => this.fail(),
      });
    } catch {
      scene.dispose();
      this.fail();
      return;
    }

    this.scene = scene;
    this.watch(canvas);
  }

  private watch(canvas: HTMLCanvasElement): void {
    const intersection = new IntersectionObserver(([entry]) => {
      this.onScreen = entry.isIntersecting;
      this.updateLoop();
    });
    intersection.observe(this.host);

    const resize = new ResizeObserver(() => this.scene?.resize());
    resize.observe(this.host);
    this.observers.push(intersection, resize);

    this.listen(document, 'visibilitychange', () => this.updateLoop());
    this.listen(window, 'pointermove', (event) => this.followMouse(event as PointerEvent));
    this.listen(document.documentElement, 'mouseleave', () => this.setPointer(0, 0));
    this.listen(canvas, 'pointerdown', (event) => this.startDrag(event as PointerEvent));
    this.listen(canvas, 'pointermove', (event) => this.moveDrag(event as PointerEvent));
    this.listen(canvas, 'pointerup', () => (this.drag = undefined));
    this.listen(canvas, 'pointercancel', () => (this.drag = undefined));
  }

  /** Runs the loop only while the stage is visible (under reduced motion: one still frame). */
  private updateLoop(): void {
    const scene = this.scene;

    if (!scene) {
      return;
    }

    const run = this.onScreen && !document.hidden;

    if (this.motion.reducedMotion()) {
      if (run) {
        scene.start();
      }
      return;
    }

    if (run === scene.isRunning) {
      return;
    }

    if (run) {
      scene.start();
    } else {
      scene.stop();
    }

    if (isDevMode()) {
      console.debug(`[hero] voxel loop ${run ? 'running' : 'paused'}`);
    }
  }

  private followMouse(event: PointerEvent): void {
    if (event.pointerType === 'touch' || !this.scene?.isRunning) {
      return;
    }

    const rect = this.host.getBoundingClientRect();

    this.setPointer(
      (event.clientX - (rect.left + rect.width / 2)) / (window.innerWidth / 2),
      (event.clientY - (rect.top + rect.height / 2)) / (window.innerHeight / 2),
    );
  }

  private startDrag(event: PointerEvent): void {
    if (event.pointerType === 'touch') {
      this.drag = { id: event.pointerId, x: event.clientX, y: event.clientY, from: { ...this.pointer } };
    }
  }

  /** A full-width horizontal drag turns the island from one end of its range to the other. */
  private moveDrag(event: PointerEvent): void {
    const drag = this.drag;

    if (!drag || drag.id !== event.pointerId) {
      return;
    }

    const rect = this.host.getBoundingClientRect();
    this.setPointer(
      drag.from.x + ((event.clientX - drag.x) / rect.width) * 2,
      drag.from.y + ((event.clientY - drag.y) / rect.height) * 2,
    );
  }

  private setPointer(x: number, y: number): void {
    this.pointer = { x: clamp(x), y: clamp(y) };
    this.scene?.setPointer(this.pointer.x, this.pointer.y);
  }

  private greet(): void {
    clearTimeout(this.greetingTimer);
    this.zone.run(() => this.greetingIndex.set(this.greetingCount++));
    this.moveBubble();
    this.greetingTimer = setTimeout(() => this.zone.run(() => this.greetingIndex.set(null)), GREETING_MS);
  }

  /** Pins the speech bubble above Kenan's head while it's open. */
  private moveBubble(): void {
    const canvas = this.canvas()?.nativeElement;

    if (!this.scene || !canvas || this.greetingIndex() === null) {
      return;
    }

    const { x, y } = this.scene.headPosition();
    this.host.style.setProperty('--head-x', `${canvas.offsetLeft + x * canvas.offsetWidth}px`);
    this.host.style.setProperty('--head-y', `${canvas.offsetTop + y * canvas.offsetHeight}px`);
  }

  private fail(): void {
    this.scene?.dispose();
    this.scene = undefined;

    if (!this.destroyed) {
      this.zone.run(() => this.state.set('fallback'));
    }
  }

  private listen(target: EventTarget, type: string, listener: (event: Event) => void): void {
    target.addEventListener(type, listener, { passive: true });
    this.removeListeners.push(() => target.removeEventListener(type, listener));
  }

  private teardown(): void {
    this.destroyed = true;

    this.cancelLoad?.();
    clearTimeout(this.greetingTimer);
    this.observers.forEach((observer) => observer.disconnect());
    this.removeListeners.forEach((remove) => remove());
    this.scene?.dispose();
    this.scene = undefined;
  }
}

function clamp(value: number): number {
  return Math.min(Math.max(value, -1), 1);
}
