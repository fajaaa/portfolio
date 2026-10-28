import { TestBed } from '@angular/core/testing';
import { Meta } from '@angular/platform-browser';
import { provideRouter } from '@angular/router';

import { App } from './app';
import { I18nService } from './core/i18n.service';
import { PageMetaService } from './core/page-meta.service';

describe('App', () => {
  // The expectations use the English copy (the site itself defaults to Bosnian).
  beforeEach(() => localStorage.setItem('kf.lang', 'en'));

  afterEach(() => {
    localStorage.removeItem('kf.introSeen');
    localStorage.removeItem('kf.lang');
  });

  function render(introSeen: boolean): HTMLElement {
    if (introSeen) {
      localStorage.setItem('kf.introSeen', '1');
    } else {
      localStorage.removeItem('kf.introSeen');
    }

    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    return fixture.nativeElement as HTMLElement;
  }

  it('renders the HUD as the page banner, the main landmark and the toast outlet', () => {
    const shell = render(true);

    expect(shell.querySelector('app-navbar')?.getAttribute('role')).toBe('banner');
    expect(shell.querySelector('main router-outlet')).toBeTruthy();
    expect(shell.querySelector('app-toast-outlet')?.getAttribute('aria-live')).toBe('polite');
  });

  it('labels the back-to-top button and keeps it out of reach until scrolled', () => {
    const button = render(true).querySelector<HTMLButtonElement>('.back-to-top')!;

    expect(button.getAttribute('aria-label')).toBe('Back to start');
    expect(button.hasAttribute('inert')).toBeTrue();
  });

  it('skips the intro for returning players', () => {
    const shell = render(true);

    expect(shell.querySelector('.intro-cover, app-intro')).toBeNull();
    expect(shell.querySelector('main')?.hasAttribute('inert')).toBeFalse();
  });

  it('shows the intro on the first visit and makes the page behind it inert', () => {
    const shell = render(false);

    expect(shell.querySelector('.intro-cover, app-intro')).toBeTruthy();
    expect(shell.querySelector('app-navbar')?.hasAttribute('inert')).toBeTrue();
    expect(shell.querySelector('main')?.hasAttribute('inert')).toBeTrue();
  });
});

describe('PageMetaService', () => {
  afterEach(() => localStorage.removeItem('kf.lang'));

  it('keeps the meta description in the current language', () => {
    localStorage.setItem('kf.lang', 'en');
    TestBed.inject(PageMetaService);
    const meta = TestBed.inject(Meta);
    const i18n = TestBed.inject(I18nService);
    TestBed.tick();

    expect(meta.getTag('name="description"')?.content).toContain('Software Engineering student');
    expect(meta.getTag('property="og:locale"')?.content).toBe('en_US');

    i18n.setLang('bs');
    TestBed.tick();

    expect(meta.getTag('name="description"')?.content).toContain('softverskog inženjerstva');
    expect(meta.getTag('property="og:description"')?.content).toContain('softverskog inženjerstva');
    expect(meta.getTag('property="og:locale"')?.content).toBe('bs_BA');
  });
});
