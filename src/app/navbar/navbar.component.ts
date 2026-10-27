import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  ElementRef,
  afterNextRender,
  computed,
  inject,
  signal,
  viewChild,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router } from '@angular/router';
import { filter } from 'rxjs';

import { KonamiService } from '../core/konami.service';
import { HUD_OFFSET, ScrollState, SmoothScrollService } from '../core/smooth-scroll.service';
import { SoundService } from '../core/sound.service';
import { WorldProgressService } from '../core/world-progress.service';
import { SectionId, WORLDS } from '../core/worlds';
import { TranslatePipe } from '../i18n/translate.pipe';
import { PixelArtComponent } from '../ui/pixel-art/pixel-art.component';
import { LOGO_SPRITE, MARKER_SPRITE } from '../ui/pixel-art/sprites';
import { PixelProgressComponent } from '../ui/pixel-progress/pixel-progress.component';
import { LangToggleComponent } from './lang-toggle/lang-toggle.component';
import { PauseMenuComponent, PauseMenuSelection } from './pause-menu/pause-menu.component';
import { SoundToggleComponent } from './sound-toggle/sound-toggle.component';

/** Same breakpoint as the SCSS: below it the menu moves into the pause menu. */
const COMPACT_QUERY = '(max-width: 760px)';

/**
 * Game HUD: logo, world menu, language and sound toggles, and the XP bar (scroll progress per
 * world). Tapping the logo 5× counts as the Konami code. The menu bar hides while scrolling down and returns on scroll up; the XP bar stays.
 */
@Component({
  selector: 'app-navbar',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslatePipe,
    PixelArtComponent,
    PixelProgressComponent,
    LangToggleComponent,
    PauseMenuComponent,
    SoundToggleComponent,
  ],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  host: {
    '[class.hud--hidden]': 'isHidden()',
    '(focusin)': 'isHidden.set(false)',
  },
})
export class NavbarComponent {
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly smoothScroll = inject(SmoothScrollService);
  private readonly konami = inject(KonamiService);
  private readonly menuToggle = viewChild<ElementRef<HTMLButtonElement>>('menuToggle');
  private readonly hideAfter = 96;

  protected readonly worlds = inject(WorldProgressService);
  protected readonly sound = inject(SoundService);
  protected readonly navItems = WORLDS;
  protected readonly totalLevels = WORLDS.length;
  protected readonly logo = LOGO_SPRITE;
  protected readonly marker = MARKER_SPRITE;

  protected readonly activeSection = computed(() => this.worlds.world().section);
  protected readonly isMenuOpen = signal(false);
  protected readonly isHidden = signal(false);
  private readonly isCompact = signal(false);
  protected readonly xpSegments = computed(() => (this.isCompact() ? 20 : 40));

  constructor() {
    const destroyRef = inject(DestroyRef);

    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(destroyRef),
      )
      .subscribe(() => {
        this.closeMenu(false);
        this.worlds.refresh();
      });

    afterNextRender(() => {
      const disconnectWorlds = this.worlds.connect();
      const stopScroll = this.smoothScroll.onScroll((state) => this.onScroll(state));
      const compact = window.matchMedia(COMPACT_QUERY);
      const onCompactChange = () => {
        this.isCompact.set(compact.matches);

        if (!compact.matches) {
          this.closeMenu(false);
        }
      };

      onCompactChange();
      compact.addEventListener('change', onCompactChange);

      destroyRef.onDestroy(() => {
        disconnectWorlds();
        stopScroll();
        compact.removeEventListener('change', onCompactChange);
        this.closeMenu(false);
      });
    });
  }

  protected openMenu(): void {
    this.sound.play('select');
    this.isMenuOpen.set(true);
    this.isHidden.set(false);
    this.smoothScroll.stop();
  }

  protected closeMenu(restoreFocus = true): void {
    if (!this.isMenuOpen()) {
      return;
    }

    this.isMenuOpen.set(false);
    this.smoothScroll.start();

    if (restoreFocus) {
      this.sound.play('back');
      this.menuToggle()?.nativeElement.focus();
    }
  }

  protected onMenuSelect({ section, event }: PauseMenuSelection): void {
    this.navigateTo(section, event);
  }

  protected navigateTo(fragment: SectionId, event: Event): void {
    event.preventDefault();
    this.sound.play('select');
    // Scrolling must be unlocked before scrollTo, or Lenis ignores it.
    this.closeMenu(false);
    this.isHidden.set(false);

    // Coming from another route (e.g. 404): let the router load the page and jump to the anchor.
    if (this.router.url.split('#')[0] !== '/') {
      this.router.navigate(['/'], { fragment });
      return;
    }

    this.smoothScroll.scrollTo(`#${fragment}`, { offset: -HUD_OFFSET });
    this.location.replaceState(this.hrefFor(fragment));
  }

  /** The logo goes home; tapping it 5 times fast is the touch version of the Konami code. */
  protected onBrandClick(event: Event): void {
    this.konami.registerLogoTap();
    this.navigateTo('home', event);
  }

  protected hrefFor(fragment: SectionId): string {
    return `/#${fragment}`;
  }

  private onScroll({ y, direction }: ScrollState): void {
    if (direction !== 0) {
      this.isHidden.set(direction === 1 && y > this.hideAfter && !this.isMenuOpen());
    }
  }
}
