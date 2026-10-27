import {
  ChangeDetectionStrategy,
  Component,
  ElementRef,
  Injector,
  afterNextRender,
  computed,
  inject,
  linkedSignal,
  signal,
  viewChild,
} from '@angular/core';

import {
  CONTACT_FIELDS,
  ContactDialogueService,
  ContactField,
  ContactStep,
  contactMailto,
} from '../core/contact-dialogue.service';
import { I18nService } from '../core/i18n.service';
import { ToastService } from '../core/toast.service';
import { I18nKey } from '../i18n/i18n.types';
import { TranslatePipe } from '../i18n/translate.pipe';
import { RevealDirective } from '../shared/reveal.directive';
import { DialogBoxComponent } from '../ui/dialog-box/dialog-box.component';
import { PixelArtComponent } from '../ui/pixel-art/pixel-art.component';
import { MARKER_LEFT_SPRITE, MARKER_SPRITE } from '../ui/pixel-art/sprites';
import { PixelButtonComponent } from '../ui/pixel-button/pixel-button.component';
import { FastTravelComponent } from './fast-travel/fast-travel.component';
import { NpcComponent } from './npc/npc.component';
import { ContactSummaryComponent } from './summary/contact-summary.component';

/**
 * WORLD 1-5: an NPC (Kenan) asks for name, email, subject and message one at a time inside a
 * dialog box, reads them back, and SEND opens a pre-filled email (mailto). The answers live in
 * ContactDialogueService. FAST TRAVEL links next to it are for visitors who skip the chat.
 */
@Component({
  selector: 'app-contact',
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    ContactSummaryComponent,
    DialogBoxComponent,
    FastTravelComponent,
    NpcComponent,
    PixelArtComponent,
    PixelButtonComponent,
    RevealDirective,
    TranslatePipe,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  private readonly contactEmail = 'kenanfajic25@gmail.com';
  private readonly i18n = inject(I18nService);
  private readonly toasts = inject(ToastService);
  private readonly injector = inject(Injector);
  protected readonly dialogue = inject(ContactDialogueService);

  private readonly dialog = viewChild.required(DialogBoxComponent);
  private readonly fieldInput = viewChild<ElementRef<HTMLElement>>('fieldInput');
  private readonly primaryButton = viewChild.required('primaryButton', {
    read: ElementRef<HTMLElement>,
  });

  protected readonly fields = CONTACT_FIELDS;
  protected readonly icons = { back: MARKER_LEFT_SPRITE, next: MARKER_SPRITE };

  protected readonly step = this.dialogue.step;
  protected readonly field = this.dialogue.field;

  /** The question for the current step; also the accessible label of its input. */
  protected readonly question = computed(() =>
    this.i18n.t(`contact.npc.${this.step()}`, { name: this.dialogue.values().name.trim() }),
  );

  /** What the NPC says: an error about the last answer, or the question. */
  protected readonly npcLine = computed(() => {
    const error = this.dialogue.error();
    return error ? this.i18n.t(error) : this.question();
  });

  /** The step whose question has been typed out; its input (or summary) shows from then on. */
  private readonly revealedStep = signal<ContactStep | null>(null);
  protected readonly revealed = computed(() => this.revealedStep() === this.step());

  /** True while the current line is being typed (the NPC moves its mouth). */
  protected readonly talking = linkedSignal({ source: this.npcLine, computation: () => true });

  /** 1-4 on the field steps, 4 (all done) on the summary, hidden otherwise. */
  protected readonly progress = computed(() => {
    const field = this.field();

    if (field) {
      return CONTACT_FIELDS.indexOf(field) + 1;
    }

    return this.step() === 'summary' ? CONTACT_FIELDS.length : null;
  });

  protected readonly primaryKey = computed<I18nKey>(() => {
    switch (this.step()) {
      case 'summary':
        return 'contact.controls.send';
      case 'sent':
        return 'contact.controls.restart';
      default:
        return 'contact.controls.next';
    }
  });

  protected onLineDone(): void {
    // A click on BACK also finishes the old line (the box skips on click) after the step changed.
    if (this.dialog().text() !== this.npcLine()) {
      return;
    }

    this.talking.set(false);
    this.revealedStep.set(this.step());
  }

  protected onInput(event: Event): void {
    const field = this.field();

    if (field) {
      this.dialogue.set(field, (event.target as HTMLInputElement | HTMLTextAreaElement).value);
    }
  }

  protected onKeydown(event: KeyboardEvent): void {
    // The input is already focused (but invisible) while its question types: any key finishes it.
    if (!this.revealed()) {
      if (event.key === 'Enter') {
        event.preventDefault();
      }

      this.dialog().skip();
      return;
    }

    if (event.key !== 'Enter' || event.isComposing) {
      return;
    }

    // Shift+Enter is a new line in the message. Touch keyboards have no Shift: Enter is the
    // new line there and NEXT moves on.
    if (this.step() === 'message' && (event.shiftKey || matchMedia('(pointer: coarse)').matches)) {
      return;
    }

    event.preventDefault();
    this.primary();
  }

  /** NEXT / SEND / NEW MESSAGE. Like in RPGs, the first press while a line types finishes it. */
  protected primary(): void {
    if (!this.revealed()) {
      this.dialog().skip();
      return;
    }

    switch (this.step()) {
      case 'summary':
        this.send();
        break;
      case 'sent':
        this.dialogue.restart();
        break;
      default:
        this.dialogue.next();
    }

    this.focusCurrent();
  }

  protected back(): void {
    this.dialogue.back();
    this.focusCurrent();
  }

  protected edit(field: ContactField): void {
    this.dialogue.edit(field);
    this.focusCurrent();
  }

  private send(): void {
    const { name, email, subject, message } = this.dialogue.finalValues();

    this.openMailto(
      contactMailto(
        this.contactEmail,
        subject,
        this.i18n.t('contact.mailBody.name', { name }),
        this.i18n.t('contact.mailBody.email', { email }),
        message,
      ),
    );

    this.dialogue.markSent();
    this.toasts.show({
      title: this.i18n.t('contact.quest.title'),
      detail: this.i18n.t('contact.quest.detail'),
      key: 'contact-quest',
      duration: 4000,
    });
  }

  private openMailto(url: string): void {
    window.location.href = url;
  }

  /**
   * After a user action: focus the current step's input (also while its question types, so
   * keyboard and screen reader users stay in place), or the main button on the other steps.
   */
  private focusCurrent(): void {
    afterNextRender(
      () => (this.fieldInput() ?? this.primaryButton()).nativeElement.focus(),
      { injector: this.injector },
    );
  }
}
