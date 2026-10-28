import { ChangeDetectionStrategy, Component, booleanAttribute, inject, input } from '@angular/core';

import { SoundService } from '../../core/sound.service';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { PixelArtComponent } from '../../ui/pixel-art/pixel-art.component';
import { SPEAKER_OFF_SPRITE, SPEAKER_ON_SPRITE } from '../../ui/pixel-art/sprites';

/**
 * Pixel speaker button that mutes / unmutes the 8-bit sounds (aria-pressed = sound on).
 * `labelled` adds the visible "SOUND" text (pause menu size).
 */
@Component({
  selector: 'app-sound-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [PixelArtComponent, TranslatePipe],
  template: `
    <button
      class="sound-toggle"
      type="button"
      [class.sound-toggle--on]="sound.enabled()"
      [attr.aria-pressed]="sound.enabled()"
      [attr.aria-label]="labelled() ? null : ('nav.sound.label' | t)"
      (pointerenter)="sound.hover($event)"
      (click)="toggle()"
    >
      <app-pixel-art
        class="sound-toggle__icon"
        [sprite]="sound.enabled() ? speakerOn : speakerOff"
      />
      @if (labelled()) {
        <span>{{ 'nav.sound.label' | t }}</span>
      }
    </button>
  `,
  styleUrl: './sound-toggle.component.scss',
  host: {
    '[class.sound-toggle-host--labelled]': 'labelled()',
  },
})
export class SoundToggleComponent {
  readonly labelled = input(false, { transform: booleanAttribute });

  protected readonly sound = inject(SoundService);
  protected readonly speakerOn = SPEAKER_ON_SPRITE;
  protected readonly speakerOff = SPEAKER_OFF_SPRITE;

  protected toggle(): void {
    if (this.sound.enabled()) {
      this.sound.play('back');
      this.sound.setEnabled(false);
    } else {
      this.sound.setEnabled(true);
      this.sound.play('select');
    }
  }
}
