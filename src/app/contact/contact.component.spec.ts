import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { MotionService } from '../core/motion.service';
import { ToastService } from '../core/toast.service';
import { ContactComponent } from './contact.component';

describe('ContactComponent (SAVE POINT)', () => {
  let fixture: ComponentFixture<ContactComponent>;
  let el: HTMLElement;

  // Reduced motion: the NPC line appears at once.
  // The expectations use the English copy (the site itself defaults to Bosnian).
  beforeEach(async () => {
    localStorage.setItem('kf.lang', 'en');
    TestBed.configureTestingModule({
      imports: [ContactComponent],
      providers: [{ provide: MotionService, useValue: { reducedMotion: signal(true) } }],
    });

    fixture = TestBed.createComponent(ContactComponent);
    el = fixture.nativeElement;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();
  });

  afterEach(() => localStorage.removeItem('kf.lang'));

  // Lets the async copy handler finish (not whenStable: the toast timer keeps it busy).
  async function settle(): Promise<void> {
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
  }

  const copyButton = () => el.querySelector<HTMLButtonElement>('.save__copy')!;

  it('shows the NPC line, the availability and every contact channel', () => {
    expect(el.querySelector('app-dialog-box')!.textContent).toContain('You made it to the end');
    expect(el.querySelector('.save__badge')!.textContent).toContain('AVAILABLE');
    expect(
      Array.from(el.querySelectorAll('.save__role'), (role) => role.textContent!.trim()),
    ).toEqual(['Job', 'Internship', 'Freelance']);

    const hrefs = Array.from(el.querySelectorAll('a'), (link) => link.getAttribute('href'));
    expect(hrefs).toEqual([
      'mailto:kenanfajic25@gmail.com',
      'https://www.linkedin.com/in/kenan-fajic',
      'https://github.com/fajaaa',
      'Kenan-CV.pdf',
    ]);
    expect(el.querySelector('.save__cv')!.hasAttribute('download')).toBeTrue();
  });

  it('copies the email address and confirms it', async () => {
    const write = spyOn(navigator.clipboard, 'writeText').and.resolveTo();

    copyButton().click();
    await settle();

    expect(write).toHaveBeenCalledOnceWith('kenanfajic25@gmail.com');
    expect(copyButton().textContent).toContain('Copied!');
    expect(TestBed.inject(ToastService).toasts()[0]).toEqual(
      jasmine.objectContaining({ title: 'Copied!', detail: 'kenanfajic25@gmail.com' }),
    );
  });

  it('says so when the clipboard is blocked', async () => {
    spyOn(navigator.clipboard, 'writeText').and.rejectWith(new Error('blocked'));

    copyButton().click();
    await settle();

    expect(copyButton().textContent).toContain('Copy');
    expect(TestBed.inject(ToastService).toasts()[0].title).toContain('Could not copy');
  });
});
