import { Component, Input, inject } from '@angular/core';

import { I18nService } from '../../core/i18n.service';
import { TranslatePipe } from '../../i18n/translate.pipe';
import { PixelButtonComponent } from '../../ui/pixel-button/pixel-button.component';
import { PixelTagComponent } from '../../ui/pixel-tag/pixel-tag.component';
import { Project } from '../projects.service';

@Component({
  selector: 'app-project-card',
  standalone: true,
  imports: [PixelButtonComponent, PixelTagComponent, TranslatePipe],
  templateUrl: './project-card.component.html',
  styleUrl: './project-card.component.scss',
})
export class ProjectCardComponent {
  private readonly i18n = inject(I18nService);

  @Input({ required: true }) project!: Project;

  /** Translated override first, then the (untranslated) GitHub description, then a default. */
  protected description(): string {
    const { descriptionKey, description } = this.project;

    if (descriptionKey) {
      return this.i18n.t(descriptionKey);
    }

    return description || this.i18n.t('projects.defaultDescription');
  }
}
