import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
} from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

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
  ],
  templateUrl: './contact.component.html',
  styleUrl: './contact.component.scss',
  animations: [
    trigger('fadeIn', [
      state('hidden', style({ opacity: 0, transform: 'translateY(2rem)' })),
      state('visible', style({ opacity: 1, transform: 'translateY(0)' })),
      transition('hidden => visible', animate('650ms cubic-bezier(0.22, 1, 0.36, 1)')),
    ]),
  ],
})
export class ContactComponent implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly formBuilder = inject(FormBuilder);
  private readonly ngZone = inject(NgZone);
  private readonly snackBar = inject(MatSnackBar);
  private observer: IntersectionObserver | undefined;
  private sendTimeoutId: ReturnType<typeof setTimeout> | undefined;

  protected isSending = false;
  protected isVisible = false;
  protected readonly contactLinks: ContactLink[] = [
    {
      label: 'Email',
      value: 'kenan@example.com',
      href: 'mailto:kenan@example.com',
      icon: 'mail',
    },
    {
      label: 'LinkedIn',
      value: 'linkedin.com/in/kenan',
      href: 'https://www.linkedin.com/in/kenan',
      icon: 'work',
    },
    {
      label: 'GitHub',
      value: 'github.com/kenan',
      href: 'https://github.com/kenan',
      icon: 'code',
    },
  ];

  protected readonly contactForm = this.formBuilder.nonNullable.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    subject: ['', Validators.required],
    message: ['', Validators.required],
  });

  ngAfterViewInit(): void {
    this.ngZone.runOutsideAngular(() => {
      this.observer = new IntersectionObserver(
        ([entry]) => {
          if (!entry.isIntersecting) {
            return;
          }

          this.ngZone.run(() => {
            this.isVisible = true;
          });
          this.observer?.disconnect();
        },
        { threshold: 0.2 },
      );

      this.observer.observe(this.elementRef.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();

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
