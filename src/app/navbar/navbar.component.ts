import { ViewportScroller } from '@angular/common';
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
import { animate, style, transition, trigger } from '@angular/animations';
import { filter } from 'rxjs';
import { NavigationEnd, Router } from '@angular/router';

type SectionId = 'home' | 'about' | 'projects' | 'skills' | 'contact';

interface NavItem {
  label: string;
  fragment: SectionId;
}

@Component({
  selector: 'app-navbar',
  standalone: true,
  templateUrl: './navbar.component.html',
  styleUrl: './navbar.component.scss',
  animations: [
    trigger('mobileMenu', [
      transition(':enter', [
        style({ height: 0, opacity: 0, transform: 'translateY(-0.5rem)' }),
        animate(
          '190ms cubic-bezier(0.22, 1, 0.36, 1)',
          style({ height: '*', opacity: 1, transform: 'translateY(0)' }),
        ),
      ]),
      transition(':leave', [
        animate(
          '150ms ease-in',
          style({ height: 0, opacity: 0, transform: 'translateY(-0.5rem)' }),
        ),
      ]),
    ]),
  ],
})
export class NavbarComponent implements OnDestroy {
  private readonly destroyRef = inject(DestroyRef);
  private readonly ngZone = inject(NgZone);
  private readonly router = inject(Router);
  private readonly viewportScroller = inject(ViewportScroller);
  private readonly hideAfter = 96;
  private lastScrollY = 0;
  private observer: IntersectionObserver | undefined;
  private observerFrame: number | undefined;
  private readonly visibleSections = new Map<SectionId, number>();

  protected readonly navItems: NavItem[] = [
    { label: 'Home', fragment: 'home' },
    { label: 'About', fragment: 'about' },
    { label: 'Projects', fragment: 'projects' },
    { label: 'Skills', fragment: 'skills' },
    { label: 'Contact', fragment: 'contact' },
  ];

  protected activeSection: SectionId = 'home';
  protected isMenuOpen = false;

  @HostBinding('class.navbar--hidden')
  protected isHidden = false;

  constructor() {
    this.viewportScroller.setOffset([0, 84]);

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

    this.router.navigate(['/'], { fragment }).then(() => {
      requestAnimationFrame(() => this.viewportScroller.scrollToAnchor(fragment));
    });
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
