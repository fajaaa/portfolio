import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

import { ScrollRevealDirective } from '../shared/scroll-reveal.directive';

interface ContactLink {
  label: string;
  value: string;
  href: string;
  icon: string;
}

@Component({
  selector: 'app-contact',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatButtonModule,
    MatFormFieldModule,
    MatIconModule,
    MatInputModule,
    MatSnackBarModule,
    ScrollRevealDirective,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent {
  private readonly contactEmail = 'kenanfajic25@gmail.com';
  private readonly formBuilder = inject(FormBuilder);
  private readonly snackBar = inject(MatSnackBar);

  protected readonly contactLinks: ContactLink[] = [
    {
      label: 'Email',
      value: this.contactEmail,
      href: `mailto:${this.contactEmail}`,
      icon: 'mail',
    },
    {
      label: 'LinkedIn',
      value: 'linkedin.com/in/kenan-fajic',
      href: 'https://www.linkedin.com/in/kenan-fajic?utm_source=share_via&utm_content=profile&utm_medium=member_android',
      icon: 'work',
    },
    {
      label: 'GitHub',
      value: 'github.com/fajaaa',
      href: 'https://github.com/fajaaa',
      icon: 'code',
    },
  ];

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
    this.snackBar.open('Email draft opened. Send it from your email app.', 'Close', {
      duration: 4500,
      panelClass: 'contact__snackbar',
    });
  }
}
