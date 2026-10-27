import { TestBed } from '@angular/core/testing';

import { NPC_BOB, NPC_IDLE, NPC_TALK } from '../contact/contact-sprites';
import { ContactDialogueService, contactError, contactMailto } from './contact-dialogue.service';

describe('ContactDialogueService', () => {
  let dialogue: ContactDialogueService;

  beforeEach(() => {
    dialogue = TestBed.inject(ContactDialogueService);
  });

  it('walks greeting → fields → summary → sent', () => {
    dialogue.next();
    expect(dialogue.step()).toBe('name');

    dialogue.set('name', 'Ana');
    dialogue.next();
    dialogue.set('email', 'ana@example.com');
    dialogue.next();
    dialogue.set('subject', 'Hi');
    dialogue.next();
    dialogue.set('message', 'Line 1\nLine 2');
    dialogue.next();
    expect(dialogue.step()).toBe('summary');

    dialogue.markSent();
    expect(dialogue.step()).toBe('sent');
  });

  it('keeps the step and sets an error for invalid answers', () => {
    dialogue.next();
    expect(dialogue.next()).toBeFalse();
    expect(dialogue.step()).toBe('name');
    expect(dialogue.error()).toBe('contact.errors.nameRequired');

    dialogue.back();
    expect(dialogue.step()).toBe('greeting');
    expect(dialogue.error()).toBeNull();
  });

  it('returns to the summary after editing a field', () => {
    dialogue.set('name', 'Ana');
    dialogue.set('email', 'ana@example.com');
    dialogue.edit('email');
    dialogue.next();

    expect(dialogue.step()).toBe('summary');
  });

  it('validates required fields and email addresses', () => {
    expect(contactError('name', '   ')).toBe('contact.errors.nameRequired');
    expect(contactError('email', 'cursed@')).toBe('contact.errors.emailInvalid');
    expect(contactError('email', ' ana@example.com ')).toBeNull();
    expect(contactError('message', 'Hi')).toBeNull();
  });

  it('builds the same mailto link as the old form', () => {
    expect(contactMailto('me@x.com', 'Hi & bye', 'Name: Ana', 'Email: a@b.co', 'Hello\nthere')).toBe(
      'mailto:me@x.com?subject=Hi%20%26%20bye&body=Name%3A%20Ana%0AEmail%3A%20a%40b.co%0A%0AHello%0Athere',
    );
  });
});

describe('NPC sprite frames', () => {
  it('are all 18x26', () => {
    for (const frame of [NPC_IDLE, NPC_BOB, NPC_TALK]) {
      expect(frame.rows.length).toBe(26);
      frame.rows.forEach((row) => expect(row.length).toBe(18));
    }
  });
});
