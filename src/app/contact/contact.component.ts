import { Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';

import { RevealDirective } from '../shared/reveal.directive';
import { PixelButtonComponent } from '../ui/pixel-button/pixel-button.component';

interface ContactLink {
  label: string;
  value: string;
  href: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [ReactiveFormsModule, PixelButtonComponent, RevealDirective],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  private readonly contactEmail = 'kenanfajic25@gmail.com';
  private readonly formBuilder = inject(FormBuilder);

  protected readonly contactLinks: ContactLink[] = [
    {
      label: 'Email',
      value: this.contactEmail,
      href: `mailto:${this.contactEmail}`,
    },
    {
      label: 'LinkedIn',
      value: 'linkedin.com/in/kenan-fajic',
      href: 'https://www.linkedin.com/in/kenan-fajic?utm_source=share_via&utm_content=profile&utm_medium=member_android',
    },
    {
      label: 'GitHub',
      value: 'github.com/fajaaa',
      href: 'https://github.com/fajaaa',
    },
  ];

  protected readonly statusMessage = signal('');

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
    const body = [`Name: ${name}`, `Email: ${email}`, '', message].join('\n');
    const mailtoUrl = `mailto:${this.contactEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;

    window.location.href = mailtoUrl;
    this.statusMessage.set('Email draft opened. Send it from your email app.');
  }
}
