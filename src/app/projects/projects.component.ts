import { CommonModule } from '@angular/common';
import { Component, inject } from '@angular/core';

import { ScrollRevealDirective } from '../shared/scroll-reveal.directive';
import { ProjectCardComponent } from './project-card/project-card.component';
import { Project, ProjectsService } from './projects.service';

@Component({
  selector: 'app-projects',
  standalone: true,
  imports: [CommonModule, ProjectCardComponent, ScrollRevealDirective],
  templateUrl: './projects.component.html',
  styleUrl: './projects.component.scss',
})
export class ProjectsComponent {
  private readonly projectsService = inject(ProjectsService);

  protected readonly projects$ = this.projectsService.getProjects();
}
