import { Injectable, computed, signal } from '@angular/core';

import { I18nKey } from '../i18n/i18n.types';

export const CONTACT_FIELDS = ['name', 'email', 'subject', 'message'] as const;
export type ContactField = (typeof CONTACT_FIELDS)[number];
export type ContactValues = Record<ContactField, string>;

export const CONTACT_STEPS = ['greeting', ...CONTACT_FIELDS, 'summary', 'sent'] as const;
export type ContactStep = (typeof CONTACT_STEPS)[number];

const EMPTY: ContactValues = { name: '', email: '', subject: '', message: '' };
const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function isContactField(step: ContactStep): step is ContactField {
  return (CONTACT_FIELDS as readonly string[]).includes(step);
}

/** The NPC's complaint about `value`, or null when it is fine. */
export function contactError(field: ContactField, value: string): I18nKey | null {
  const trimmed = value.trim();

  if (!trimmed) {
    return `contact.errors.${field}Required`;
  }

  return field === 'email' && !EMAIL_PATTERN.test(trimmed) ? 'contact.errors.emailInvalid' : null;
}

/** `mailto:` link with the subject and a body of "Name: …", "Email: …", a blank line and the message. */
export function contactMailto(
  to: string,
  subject: string,
  nameLine: string,
  emailLine: string,
  message: string,
): string {
  const body = [nameLine, emailLine, '', message].join('\n');

  return `mailto:${to}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

/**
 * State of the WORLD 1-5 NPC contact dialogue: greeting → name → email → subject → message →
 * summary → sent. Root-provided, so the answers survive the section scrolling away (or being
 * re-created) for the rest of the visit.
 */
@Injectable({ providedIn: 'root' })
export class ContactDialogueService {
  private readonly current = signal<ContactStep>('greeting');
  private readonly answers = signal<ContactValues>(EMPTY);
  /** Set by "edit" on the summary: the next valid answer goes straight back to the summary. */
  private readonly editing = signal(false);

  readonly step = this.current.asReadonly();
  readonly values = this.answers.asReadonly();
  /** Error line for the current field, cleared by any step change. */
  readonly error = signal<I18nKey | null>(null);

  readonly field = computed(() => {
    const step = this.current();
    return isContactField(step) ? step : null;
  });

  set(field: ContactField, value: string): void {
    this.answers.update((values) => ({ ...values, [field]: value }));
  }

  /** Validates the current field (if any) and moves on. Returns false when the answer is rejected. */
  next(): boolean {
    const field = this.field();

    if (field) {
      const error = contactError(field, this.answers()[field]);
      this.error.set(error);

      if (error) {
        return false;
      }
    }

    const index = CONTACT_STEPS.indexOf(this.current());
    this.go(field && this.editing() ? 'summary' : CONTACT_STEPS[index + 1]);
    return true;
  }

  back(): void {
    const index = CONTACT_STEPS.indexOf(this.current());
    this.go(CONTACT_STEPS[Math.max(index - 1, 0)]);
  }

  edit(field: ContactField): void {
    this.go(field);
    this.editing.set(true);
  }

  /** The values to send, with stray spaces trimmed from the one-line fields. */
  finalValues(): ContactValues {
    const { name, email, subject, message } = this.answers();
    return { name: name.trim(), email: email.trim(), subject: subject.trim(), message };
  }

  markSent(): void {
    this.go('sent');
  }

  /** New message: keeps the name and email, clears the rest and starts over. */
  restart(): void {
    this.answers.update(({ name, email }) => ({ ...EMPTY, name, email }));
    this.go('greeting');
  }

  private go(step: ContactStep): void {
    this.current.set(step);
    this.error.set(null);
    this.editing.set(false);
  }
}
