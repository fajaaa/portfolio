import { Component } from '@angular/core';

import { I18nKey } from '../i18n/i18n.types';
import { TranslatePipe } from '../i18n/translate.pipe';
import { RevealDirective } from '../shared/reveal.directive';

interface SkillCategory {
  titleKey: I18nKey;
  summaryKey: I18nKey;
  skills: string[];
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [RevealDirective, TranslatePipe],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
})
export class SkillsComponent {
  protected readonly categories: SkillCategory[] = [
    {
      titleKey: 'skills.categories.programming.title',
      summaryKey: 'skills.categories.programming.summary',
      skills: ['C++', 'C#', 'HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'Angular', 'Dart', 'Flutter'],
    },
    {
      titleKey: 'skills.categories.databases.title',
      summaryKey: 'skills.categories.databases.summary',
      skills: ['MySQL', 'Firebase'],
    },
    {
      titleKey: 'skills.categories.tools.title',
      summaryKey: 'skills.categories.tools.summary',
      skills: ['Git', 'Docker', 'Visual Studio', 'VS Code', 'WebStorm'],
    },
  ];
}
