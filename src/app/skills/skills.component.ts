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
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

interface Skill {
  label: string;
  icon: string;
  level: number;
}

interface SkillCategory {
  title: string;
  summary: string;
  skills: Skill[];
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTabsModule],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
  animations: [
    trigger('cardSlide', [
      state('hiddenLeft', style({ opacity: 0, transform: 'translateX(-2.5rem)' })),
      state('hiddenRight', style({ opacity: 0, transform: 'translateX(2.5rem)' })),
      state('visible', style({ opacity: 1, transform: 'translateX(0)' })),
      transition('* => visible', animate('620ms cubic-bezier(0.22, 1, 0.36, 1)')),
    ]),
    trigger('skillBar', [
      state('hidden', style({ width: '0%' })),
      state('visible', style({ width: '{{ level }}%' }), { params: { level: 0 } }),
      transition('hidden => visible', animate('850ms 180ms cubic-bezier(0.22, 1, 0.36, 1)')),
    ]),
  ],
})
export class SkillsComponent implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly ngZone = inject(NgZone);
  private observer: IntersectionObserver | undefined;

  protected isVisible = false;
  protected readonly categories: SkillCategory[] = [
    {
      title: 'Frontend',
      summary: 'Interfaces, state, responsive layouts, and component systems.',
      skills: [
        { label: 'Angular', icon: 'view_quilt', level: 92 },
        { label: 'TypeScript', icon: 'data_object', level: 90 },
        { label: 'HTML/CSS', icon: 'web', level: 95 },
        { label: 'SCSS', icon: 'palette', level: 88 },
      ],
    },
    {
      title: 'Backend',
      summary: 'APIs, persistence, authentication, and service architecture.',
      skills: [
        { label: 'Node.js', icon: 'hub', level: 86 },
        { label: 'Express', icon: 'route', level: 84 },
        { label: 'REST APIs', icon: 'api', level: 90 },
        { label: 'SQL', icon: 'storage', level: 82 },
      ],
    },
    {
      title: 'Tools & DevOps',
      summary: 'Developer workflow, containers, collaboration, and delivery.',
      skills: [
        { label: 'Git', icon: 'account_tree', level: 90 },
        { label: 'Docker', icon: 'deployed_code', level: 78 },
        { label: 'VS Code', icon: 'terminal', level: 94 },
        { label: 'Figma', icon: 'design_services', level: 74 },
      ],
    },
  ];

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
        { threshold: 0.22 },
      );

      this.observer.observe(this.elementRef.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }

  protected cardState(index: number): string {
    if (this.isVisible) {
      return 'visible';
    }

    return index % 2 === 0 ? 'hiddenLeft' : 'hiddenRight';
  }
}
