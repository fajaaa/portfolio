import { Component, Input } from '@angular/core';

import { PixelButtonComponent } from '../../ui/pixel-button/pixel-button.component';
import { PixelTagComponent } from '../../ui/pixel-tag/pixel-tag.component';
import { Project } from '../projects.service';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [PixelButtonComponent, PixelTagComponent],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.scss',
})
export class ProjectCardComponent {
  @Input({ required: true }) project!: Project;
}
