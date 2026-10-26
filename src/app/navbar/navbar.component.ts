import { Location } from '@angular/common';
import {
  Component,
  DestroyRef,
  HostBinding,
  HostListener,
  NgZone,
  OnDestroy,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { filter } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';

import { I18nService } from '../core/i18n.service';
import { HUD_OFFSET, SmoothScrollService } from '../core/smooth-scroll.service';
import { I18nKey, LANGS, Lang } from '../i18n/i18n.types';
import { TranslatePipe } from '../i18n/translate.pipe';

type SectionId = 'home' | 'about' | 'projects' | 'skills' | 'contact';

interface NavItem {
  labelKey: I18nKey;
  fragment: SectionId;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [TranslatePipe],
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
})
export class NavbarComponent implements OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);
  private readonly router = inject(Router);
  private readonly location = inject(Location);
  private readonly smoothScroll = inject(SmoothScrollService);
  private readonly hideAfter = 96;
  private lastScrollY = 0;
  private observer: IntersectionObserver | undefined;
  private observerFrame: number | undefined;
  private readonly visibleSections = new Map<SectionId, number>();

  protected readonly i18n = inject(I18nService);
  protected readonly langs = LANGS;
  protected readonly langLabels: Record<Lang, I18nKey> = {
    en: 'nav.language.en',
    bs: 'nav.language.bs',
  };

  protected readonly navItems: NavItem[] = [
    { labelKey: 'nav.links.home', fragment: 'home' },
    { labelKey: 'nav.links.about', fragment: 'about' },
    { labelKey: 'nav.links.projects', fragment: 'projects' },
    { labelKey: 'nav.links.skills', fragment: 'skills' },
    { labelKey: 'nav.links.contact', fragment: 'contact' },
  ];

  protected activeSection: SectionId = 'home';
  protected isMenuOpen = false;

  @HostBinding('class.navbar--hidden')
  protected isHidden = false;

  constructor() {
    this.router.events
      .pipe(
        filter((event): event is NavigationEnd => event instanceof NavigationEnd),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        this.isMenuOpen = false;
        this.queueSectionObserver();
      });

    this.queueSectionObserver();
  }

  @HostListener('window:scroll')
  protected onWindowScroll(): void {
    const currentScrollY = Math.max(window.scrollY, 0);
    const isScrollingDown = currentScrollY > this.lastScrollY;

    this.isHidden = isScrollingDown && currentScrollY > this.hideAfter && !this.isMenuOpen;
    this.lastScrollY = currentScrollY;

    if (!this.observer) {
      this.updateActiveSectionFromScroll();
    }
  }

  @HostListener('window:resize')
  protected onWindowResize(): void {
    if (window.innerWidth > 760) {
      this.isMenuOpen = false;
    }

    this.queueSectionObserver();
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();

    if (this.observerFrame !== undefined) {
      cancelAnimationFrame(this.observerFrame);
    }
  }

  protected toggleMenu(): void {
    this.isMenuOpen = !this.isMenuOpen;
    this.isHidden = false;
  }

  protected navigateTo(fragment: SectionId, event: Event): void {
    event.preventDefault();
    this.isMenuOpen = false;
    this.isHidden = false;
    this.activeSection = fragment;

    // Coming from another route (e.g. 404): let the router load the page and jump to the anchor.
    if (this.router.url.split('#')[0] !== '/') {
      this.router.navigate(['/'], { fragment });
      return;
    }

    this.smoothScroll.scrollTo(`#${fragment}`, { offset: -HUD_OFFSET });
    this.location.replaceState(this.hrefFor(fragment));
  }

  protected hrefFor(fragment: SectionId): string {
    return `/#${fragment}`;
  }

  private queueSectionObserver(): void {
    if (this.observerFrame !== undefined) {
      cancelAnimationFrame(this.observerFrame);
    }

    this.observerFrame = requestAnimationFrame(() => {
      this.observerFrame = requestAnimationFrame(() => {
        this.observerFrame = undefined;
        this.observeSections();
      });
    });
  }

  private observeSections(): void {
    this.observer?.disconnect();
    this.observer = undefined;
    this.visibleSections.clear();

    const sections = this.navItems
      .map(({ fragment }) => document.getElementById(fragment))
      .filter((section): section is HTMLElement => section instanceof HTMLElement);

    if (!sections.length || !('IntersectionObserver' in window)) {
      this.updateActiveSectionFromScroll();
      return;
    }

    this.ngZone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        (entries) => {
          for (const entry of entries) {
            const sectionId = entry.target.id as SectionId;
            this.visibleSections.set(sectionId, entry.isIntersecting ? entry.intersectionRatio : 0);
          }

          const activeSection = this.getMostVisibleSection();

          if (activeSection && activeSection !== this.activeSection) {
            this.ngZone.run(() => {
              this.activeSection = activeSection;
            });
          }
        },
        {
          root: null,
          rootMargin: '-32% 0px -54% 0px',
          threshold: [0, 0.15, 0.3, 0.5, 0.75, 1],
        },
      );

      sections.forEach((section) => this.observer?.observe(section));
    });
  }

  private getMostVisibleSection(): SectionId | undefined {
    const visibleSection = this.navItems
      .map(({ fragment }) => ({
        fragment,
        ratio: this.visibleSections.get(fragment) ?? 0,
      }))
      .filter(({ ratio }) => ratio > 0)
      .sort((a, b) => b.ratio - a.ratio)[0];

    return visibleSection?.fragment;
  }

  private updateActiveSectionFromScroll(): void {
    const nextSection = this.navItems
      .map(({ fragment }) => ({
        fragment,
        top: document.getElementById(fragment)?.getBoundingClientRect().top ?? Number.POSITIVE_INFINITY,
      }))
      .filter(({ top }) => top <= window.innerHeight * 0.4)
      .sort((a, b) => b.top - a.top)[0]?.fragment;

    this.activeSection = nextSection ?? 'home';
  }
}
