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
  let languageSpy: jasmine.Spy;

  beforeEach(() => {
    localStorage.removeItem('kf.lang');
    languageSpy = spyOnProperty(navigator, 'language').and.returnValue('en-US');
  });

  afterEach(() => localStorage.removeItem('kf.lang'));

  it('picks Bosnian for bs/hr/sr browsers and English otherwise', () => {
    languageSpy.and.returnValue('hr-HR');
    expect(TestBed.inject(I18nService).lang()).toBe('bs');
  });

  it('prefers the stored language over the browser language', () => {
    localStorage.setItem('kf.lang', 'bs');
    expect(TestBed.inject(I18nService).lang()).toBe('bs');
  });

  it('switches, persists and updates <html lang>', () => {
    const i18n = TestBed.inject(I18nService);
    expect(i18n.t('nav.links.about')).toBe('About');

    i18n.setLang('bs');

    expect(i18n.t('nav.links.about')).toBe('O meni');
    expect(i18n.list('hero.subtitles').length).toBeGreaterThan(0);
    expect(localStorage.getItem('kf.lang')).toBe('bs');
    expect(document.documentElement.lang).toBe('bs');
  });

  it('interpolates params', () => {
    const i18n = TestBed.inject(I18nService);
    expect(i18n.t('projects.card.codeLabel', { title: 'AquaControl' })).toBe(
      'AquaControl GitHub repository',
    );
  });

  it('updates the navbar instantly and marks the active language', () => {
    TestBed.configureTestingModule({ providers: [provideRouter([])] });
    const fixture = TestBed.createComponent(NavbarComponent);
    fixture.detectChanges();
    const host = fixture.nativeElement as HTMLElement;
    const [enButton, bsButton] = Array.from(
      host.querySelectorAll<HTMLButtonElement>('.navbar__lang-button'),
    );

    bsButton.click();
    fixture.detectChanges();

    expect(host.querySelector('.navbar__link')?.textContent?.trim()).toBe('Početna');
    expect(bsButton.getAttribute('aria-pressed')).toBe('true');
    expect(enButton.getAttribute('aria-pressed')).toBe('false');
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
    expect(title.getTitle()).toBe('Page not found');

    TestBed.inject(I18nService).setLang('bs');
    TestBed.tick();

    expect(title.getTitle()).toBe('Stranica nije pronađena');
  });
});
