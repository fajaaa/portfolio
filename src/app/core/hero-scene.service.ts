import { Injectable, signal } from '@angular/core';

/**
 * Lets code outside the hero talk to its voxel scene: `ready` turns true on the scene's first
 * frame (or when it falls back to the static image), and `celebrate()` reaches the live scene.
 */
@Injectable({ providedIn: 'root' })
export class HeroSceneService {
  private readonly isReady = signal(false);
  private celebrateHandler: (() => void) | undefined;

  readonly ready = this.isReady.asReadonly();

  markReady(): void {
    this.isReady.set(true);
  }

  /** Registers the scene's celebrate(); returns a function that unregisters it. */
  attach(celebrate: () => void): () => void {
    this.celebrateHandler = celebrate;

    return () => {
      if (this.celebrateHandler === celebrate) {
        this.celebrateHandler = undefined;
      }
    };
  }

  /** Plays the scene's easter-egg animation; does nothing when there's no hero scene. */
  celebrate(): void {
    this.celebrateHandler?.();
  }
}
