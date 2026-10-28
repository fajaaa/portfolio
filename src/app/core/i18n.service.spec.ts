import { Component } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { Title } from '@angular/platform-browser';
import { Router, TitleStrategy, provideRouter } from '@angular/router';

import { NavbarComponent } from '../navbar/navbar.component';
import { I18nTitleStrategy } from './i18n-title.strategy';
import { I18nService } from './i18n.service';

@Component({ template: '' })
class EmptyComponent {}

describe('I18nService', () => {
  beforeEach(() => {
    localStorage.removeItem('kf.lang');
    // An English browser: the site must still start in Bosnian.
    spyOnProperty(navigator, 'language').and.returnValue('en-US');
  });

  afterEach(() => localStorage.removeItem('kf.lang'));

  it('defaults to Bosnian, whatever the browser language', () => {
    expect(TestBed.inject(I18nService).lang()).toBe('bs');
    expect(document.documentElement.lang).toBe('bs');
  });

  it('prefers the stored language over the default', () => {
    localStorage.setItem('kf.lang', 'en');
    expect(TestBed.inject(I18nService).lang()).toBe('en');
  });

  it('switches, persists and updates <html lang>', () => {
    const i18n = TestBed.inject(I18nService);
    expect(i18n.t('nav.links.about')).toBe('O meni');

    i18n.setLang('en');

    expect(i18n.t('nav.links.about')).toBe('About');
    expect(i18n.list('hero.subtitles').length).toBeGreaterThan(0);
    expect(localStorage.getItem('kf.lang')).toBe('en');
    expect(document.documentElement.lang).toBe('en');
  });

  it('interpolates params', () => {
    const i18n = TestBed.inject(I18nService);
    expect(i18n.t('projects.screen.codeLabel', { title: 'AquaControl' })).toBe(
      'Pogledaj kod projekta AquaControl na GitHubu',
    );
  });

  it('picks plural forms per language', () => {
    const i18n = TestBed.inject(I18nService);
    i18n.setLang('en');

    expect(i18n.plural('projects.count', 1)).toBe('1 GAME FOUND');
    expect(i18n.plural('projects.count', 21)).toBe('21 GAMES FOUND');

    i18n.setLang('bs');

    expect(i18n.plural('projects.count', 1)).toBe('1 IGRA PRONAĐENA');
    expect(i18n.plural('projects.count', 3)).toBe('3 IGRE PRONAĐENE');
    expect(i18n.plural('projects.count', 5)).toBe('5 IGARA PRONAĐENO');
    expect(i18n.plural('projects.count', 12)).toBe('12 IGARA PRONAĐENO');
    expect(i18n.plural('projects.count', 21)).toBe('21 IGRA PRONAĐENA');
    expect(i18n.plural('projects.count', 22)).toBe('22 IGRE PRONAĐENE');
  });

  it('updates the navbar instantly and marks the active language', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(NavbarComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const [enButton, bsButton] = Array.from(
      host.querySelectorAll<HTMLButtonElement>('.lang-toggle__button'),
    );

    expect(host.querySelector('.hud__link')?.textContent?.trim()).toBe('Početna');
    expect(bsButton.getAttribute('aria-pressed')).toBe('true');

    enButton.click();
    fixture.detectChanges();

    expect(host.querySelector('.hud__link')?.textContent?.trim()).toBe('Home');
    expect(enButton.getAttribute('aria-pressed')).toBe('true');
    expect(bsButton.getAttribute('aria-pressed')).toBe('false');
  });

  it('translates route titles and re-translates them on language change', async () => {
    TestBed.configureTestingModule({
      providers: [
        provideRouter([{ path: '', component: EmptyComponent, title: 'meta.title.notFound' }]),
        { provide: TitleStrategy, useClass: I18nTitleStrategy },
      ],
    });
    await TestBed.inject(Router).navigateByUrl('/');
    TestBed.tick();
    const title = TestBed.inject(Title);
    expect(title.getTitle()).toBe('Stranica nije pronađena');

    TestBed.inject(I18nService).setLang('en');
    TestBed.tick();

    expect(title.getTitle()).toBe('Page not found');
  });
});
