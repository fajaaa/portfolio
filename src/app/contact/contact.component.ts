import { CommonModule } from '@angular/common';
import { Component, NgZone, OnDestroy, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
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
    MatProgressSpinnerModule,
    MatSnackBarModule,
    ScrollRevealDirective,
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
})
export class ContactComponent implements OnDestroy {
  private readonly formBuilder = inject(FormBuilder);
  private readonly ngZone = inject(NgZone);
  private readonly snackBar = inject(MatSnackBar);
  private sendTimeoutId: ReturnType<typeof setTimeout> | undefined;

  protected isSending = false;
  protected readonly contactLinks: ContactLink[] = [
    {
      label: 'Email',
      value: 'kenanfajic25@gmail.com',
      href: 'mailto:kenanfajic25@gmail.com',
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

  ngOnDestroy(): void {
    if (this.sendTimeoutId) {
      clearTimeout(this.sendTimeoutId);
    }
  }

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
    if (this.contactForm.invalid || this.isSending) {
      this.contactForm.markAllAsTouched();
      return;
    }

    this.isSending = true;

    this.sendTimeoutId = setTimeout(() => {
      this.ngZone.run(() => {
        this.isSending = false;
        this.contactForm.reset();
        this.snackBar.open('Message sent successfully! 🚀', 'Close', {
          duration: 3500,
          panelClass: 'contact__snackbar',
        });
      });
    }, 2000);
  }
}
