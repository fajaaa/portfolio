import { CommonModule } from '@angular/common';
import {
  AfterViewInit,
  Component,
  ElementRef,
  NgZone,
  OnDestroy,
  inject,
} from '@angular/core';
import { animate, query, stagger, style, transition, trigger } from '@angular/animations';

import { ProjectCardComponent } from './project-card/project-card.component';
import { Project, ProjectsService } from './projects.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, ProjectCardComponent],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
  animations: [
    trigger('projectsStagger', [
      transition('hidden => visible', [
        query(
          '.projects__item',
          [
            style({ opacity: 0, transform: 'translateY(1.75rem)' }),
            stagger(120, [
              animate('560ms cubic-bezier(0.22, 1, 0.36, 1)', style({ opacity: 1, transform: 'translateY(0)' })),
            ]),
          ],
          { optional: true },
        ),
      ]),
    ]),
  ],
})
export class ProjectsComponent implements AfterViewInit, OnDestroy {
  private readonly elementRef = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly ngZone = inject(NgZone);
  private readonly projectsService = inject(ProjectsService);
  private observer: IntersectionObserver | undefined;

  protected isVisible = false;
  protected readonly projects: Project[] = this.projectsService.getProjects();

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
        { threshold: 0.18 },
      );

      this.observer.observe(this.elementRef.nativeElement);
    });
  }

  ngOnDestroy(): void {
    this.observer?.disconnect();
  }
}
