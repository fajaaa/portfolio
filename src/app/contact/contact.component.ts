import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { I18nService } from '../core/i18n.service';
import { I18nKey } from '../i18n/i18n.types';
import { TranslatePipe } from '../i18n/translate.pipe';
import { RevealDirective } from '../shared/reveal.directive';
import { PixelButtonComponent } from '../ui/pixel-button/pixel-button.component';

interface ContactLink {
  labelKey: I18nKey;
  value: string;
  href: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, PixelButtonComponent, RevealDirective, TranslatePipe],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  private readonly contactEmail = 'kenanfajic25@gmail.com';
  private readonly formBuilder = inject(FormBuilder);
  private readonly i18n = inject(I18nService);

  protected readonly contactLinks: ContactLink[] = [
    {
      labelKey: 'contact.links.email',
      value: this.contactEmail,
      href: `mailto:${this.contactEmail}`,
    },
    {
      labelKey: 'contact.links.linkedin',
      value: 'linkedin.com/in/kenan-fajic',
      href: 'https://www.linkedin.com/in/kenan-fajic?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    },
    {
      labelKey: 'contact.links.github',
      value: 'github.com/fajaaa',
      href: 'https://github.com/fajaaa',
    },
  ];

  /** Kept as a key so the confirmation follows a later language switch. */
  protected readonly statusKey = signal<I18nKey | null>(null);

  protected readonly contactForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', Validators.required],
  });

  protected get name() {
    return this.contactForm.controls.name;
  }

  protected get email() {
    return this.contactForm.controls.email;
  }

  protected get subject() {
    return this.contactForm.controls.subject;
  }

  protected get message() {
    return this.contactForm.controls.message;
  }

  protected submit(): void {
    if (this.contactForm.invalid) {
      this.contactForm.markAllAsTouched();
      return;
    }

    const { name, email, subject, message } = this.contactForm.getRawValue();
    const body = [
      this.i18n.t('contact.mailBody.name', { name }),
      this.i18n.t('contact.mailBody.email', { email }),
      '',
      message,
    ].join('\n');
    const mailtoUrl = `mailto:${this.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;
    this.statusKey.set('contact.sent');
  }
}
