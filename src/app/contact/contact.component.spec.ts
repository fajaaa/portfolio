import { ComponentFixture, TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';

import { MotionService } from '../core/motion.service';
import { ToastService } from '../core/toast.service';
import { ContactComponent } from './contact.component';

describe('ContactComponent (NPC dialogue)', () => {
  let fixture: ComponentFixture<ContactComponent>;
  let el: HTMLElement;

  // Reduced motion: lines appear at once, so the flow can be stepped through synchronously.
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [ContactComponent],
      providers: [{ provide: MotionService, useValue: { reducedMotion: signal(true) } }],
    });
  });

  async function mount(): Promise<void> {
    fixture = TestBed.createComponent(ContactComponent);
    el = fixture.nativeElement;
    await settle();
  }

  // Lets the dialog box's deferred `done` run (not whenStable: the toast's timer keeps it busy).
  async function settle(): Promise<void> {
    fixture.detectChanges();
    await new Promise((resolve) => setTimeout(resolve));
    fixture.detectChanges();
  }

  const line = () => el.querySelector('.dialog-box__text .visually-hidden')!.textContent!.trim();
  const input = () => el.querySelector<HTMLInputElement | HTMLTextAreaElement>('.contact__input')!;
  const primary = () => el.querySelector<HTMLButtonElement>('.contact__buttons button:last-child')!;

  async function type(value: string): Promise<void> {
    input().value = value;
    input().dispatchEvent(new Event('input'));
    await settle();
  }

  async function press(key: string, shiftKey = false): Promise<void> {
    input().dispatchEvent(new KeyboardEvent('keydown', { key, shiftKey, bubbles: true }));
    await settle();
  }

  it('runs the whole flow from the keyboard and opens the same mailto as before', async () => {
    await mount();
    const component = fixture.componentInstance as unknown as { openMailto(url: string): void };
    const open = spyOn(component, 'openMailto');

    expect(line()).toContain('Hey, traveler!');
    primary().click();
    await settle();

    // Name: required, the error is an NPC line and focus stays in the input.
    expect(document.activeElement).toBe(input());
    expect(input().getAttribute('aria-labelledby')).toBe('contact-question');
    await press('Enter');
    expect(line()).toContain("didn't catch your name");
    expect(input().getAttribute('aria-invalid')).toBe('true');
    expect(document.activeElement).toBe(input());

    await type('Ana');
    await press('Enter');
    expect(line()).toContain('Nice to meet you, Ana!');

    await type('cursed@');
    await press('Enter');
    expect(line()).toBe('Hmm, that email looks cursed. Try again?');

    await type('ana@example.com');
    await press('Enter');
    await type('Hi & bye');
    await press('Enter');

    // Message: Shift+Enter is a new line, Enter moves on.
    expect(input().tagName).toBe('TEXTAREA');
    await type('Hello\nthere');
    await press('Enter', true);
    expect(input().tagName).toBe('TEXTAREA');
    await press('Enter');

    // Summary: edit jumps back to the field and Enter returns to the summary.
    expect(el.querySelectorAll('.summary__value').length).toBe(4);
    el.querySelectorAll<HTMLButtonElement>('.summary__edit')[1].click();
    await settle();
    expect(input().value).toBe('ana@example.com');
    expect(document.activeElement).toBe(input());
    await press('Enter');
    expect(el.querySelector('app-contact-summary')).not.toBeNull();

    primary().click();
    await settle();

    expect(open).toHaveBeenCalledOnceWith(
      'mailto:kenanfajic25@gmail.com?subject=Hi%20%26%20bye&body=Name%3A%20Ana%0AEmail%3A%20ana%40example.com%0A%0AHello%0Athere',
    );
    expect(line()).toContain('Thanks, Ana!');
    expect(TestBed.inject(ToastService).toasts()[0].title).toBe('QUEST COMPLETE');

    // The dialogue state outlives the component.
    fixture.destroy();
    await mount();
    expect(line()).toContain('Thanks, Ana!');
  });

  it('finishes a typing line on the first press and keeps the input focused meanwhile', async () => {
    TestBed.overrideProvider(MotionService, { useValue: { reducedMotion: signal(false) } });
    await mount();

    primary().click(); // finishes the greeting
    await settle();
    expect(line()).toContain('Hey, traveler!');
    expect(el.querySelector('.contact__field')).toBeNull();

    primary().click(); // moves on
    await settle();
    const field = el.querySelector('.contact__field')!;
    expect(field.classList).toContain('contact__field--hidden');
    expect(document.activeElement).toBe(input());

    expect(el.querySelector('app-dialog-box')!.classList).toContain('dialog-box--typing');

    await press('A'); // any key while the question types shows it all, and the input
    expect(field.classList).not.toContain('contact__field--hidden');
    expect(el.querySelector('app-npc')!.classList).not.toContain('npc--talking');
  });

  it('goes back a step with BACK', async () => {
    await mount();
    primary().click();
    await settle();
    await type('Ana');
    await press('Enter');

    el.querySelector<HTMLButtonElement>('.contact__buttons button:first-child')!.click();
    await settle();

    expect(line()).toContain('what should I call you?');
    expect(input().value).toBe('Ana');
  });
});
