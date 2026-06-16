import { CommonModule } from '@angular/common';
import { Component, Input } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { MatIconModule } from '@angular/material/icon';

import { Project } from '../projects.service';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [CommonModule, MatButtonModule, MatChipsModule, MatIconModule],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.scss',
  animations: [
    trigger('cardHover', [
      state('rest', style({ transform: 'scale(1)', boxShadow: 'var(--shadow-card)' })),
      state(
        'hover',
        style({
          transform: 'scale(1.03)',
          boxShadow: '0 1.5rem 3.5rem rgba(var(--color-accent-rgb), 0.34)',
        }),
      ),
      transition('rest <=> hover', animate('180ms ease-out')),
    ]),
    trigger('overlayReveal', [
      state('rest', style({ opacity: 0, pointerEvents: 'none', transform: 'translateY(0.75rem)' })),
      state('hover', style({ opacity: 1, pointerEvents: 'auto', transform: 'translateY(0)' })),
      transition('rest <=> hover', animate('180ms ease-out')),
    ]),
  ],
})
export class ProjectCardComponent {
  @Input({ required: true }) project!: Project;

  protected hoverState: 'rest' | 'hover' = 'rest';

  protected setHoverState(state: 'rest' | 'hover'): void {
    this.hoverState = state;
  }
}
