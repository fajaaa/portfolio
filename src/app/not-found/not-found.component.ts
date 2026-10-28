import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  Injector,
  NgZone,
  afterNextRender,
  effect,
  inject,
  signal,
  untracked,
  viewChildren,
} from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { IntroService } from '../core/intro.service';
import { SoundService } from '../core/sound.service';
import { TranslatePipe } from '../i18n/translate.pipe';
import { DialogBoxComponent } from '../ui/dialog-box/dialog-box.component';
import { PixelArtComponent } from '../ui/pixel-art/pixel-art.component';
import { MARKER_SPRITE } from '../ui/pixel-art/sprites';
import { PixelButtonComponent } from '../ui/pixel-button/pixel-button.component';
import { KNOCKED_OUT_SPRITE } from './knocked-out-sprite';

type GameOverState = 'continue' | 'thanks' | 'insertCoin';

const COUNTDOWN_FROM = 9;
/** Wait for the letters to land before the jingle and the countdown start. */
const SETTLE_MS = 900;

/**
 * 404 as a GAME OVER screen: the letters drop in, Kenan lies knocked out and "CONTINUE?" counts
 * down from 9. YES goes home, NO shows "THANKS FOR PLAYING"; at 0 it's "INSERT COIN". Arrow
 * keys move between YES and NO, Enter picks. Waits for the intro (if open) before starting.
 */
@Component({
  selector: 'app-not-found',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslatePipe, DialogBoxComponent, PixelArtComponent, PixelButtonComponent],
  templateUrl: './not-found.component.html',
  styleUrl: './not-found.component.scss',
})
export class NotFoundComponent {
  private readonly router = inject(Router);
  private readonly zone = inject(NgZone);
  private readonly injector = inject(Injector);
  private readonly sound = inject(SoundService);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef).nativeElement;
  private readonly options = viewChildren<ElementRef<HTMLButtonElement>>('option');
  private settleTimer: ReturnType<typeof setTimeout> | undefined;
  private countdownTimer: ReturnType<typeof setInterval> | undefined;

  protected readonly introDone = inject(IntroService).introDone;
  protected readonly sprite = KNOCKED_OUT_SPRITE;
  protected readonly marker = MARKER_SPRITE;
  protected readonly letters = Array.from('GAME OVER');
  protected readonly state = signal<GameOverState>('continue');
  protected readonly count = signal(COUNTDOWN_FROM);
  /** 0 = YES, 1 = NO. */
  protected readonly selected = signal(0);

  constructor() {
    const rendered = signal(false);
    afterNextRender(() => rendered.set(true));

    effect(() => {
      if (rendered() && this.introDone()) {
        untracked(() => this.begin());
      }
    });

    inject(DestroyRef).onDestroy(() => {
      clearTimeout(this.settleTimer);
      clearInterval(this.countdownTimer);
    });
  }

  protected yes(): void {
    this.stopCountdown();
    this.sound.play('select');
    this.router.navigateByUrl('/');
  }

  protected no(): void {
    this.stopCountdown();
    this.sound.play('back');
    this.state.set('thanks');
    this.focusAfterRender('.game-over__home');
  }

  /** Any arrow key switches between YES and NO. */
  protected onOptionKeydown(event: KeyboardEvent): void {
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(event.key)) {
      return;
    }

    event.preventDefault();
    const next = this.selected() === 0 ? 1 : 0;
    this.selected.set(next);
    this.options()[next]?.nativeElement.focus();
    this.sound.play('hover');
  }

  private begin(): void {
    this.options()[0]?.nativeElement.focus({ preventScroll: true });

    this.zone.runOutsideAngular(() => {
      this.settleTimer = setTimeout(() => {
        this.sound.play('gameOver');
        this.countdownTimer = setInterval(() => this.tick(), 1000);
      }, SETTLE_MS);
    });
  }

  private tick(): void {
    const next = this.count() - 1;
    this.count.set(Math.max(next, 0));

    if (next <= 0) {
      this.zone.run(() => {
        this.stopCountdown();
        this.state.set('insertCoin');
        this.focusAfterRender('.game-over__home');
      });
    }
  }

  private stopCountdown(): void {
    clearTimeout(this.settleTimer);
    clearInterval(this.countdownTimer);
  }

  private focusAfterRender(selector: string): void {
    afterNextRender(
      () => this.host.querySelector<HTMLElement>(selector)?.focus({ preventScroll: true }),
      { injector: this.injector },
    );
  }
}
