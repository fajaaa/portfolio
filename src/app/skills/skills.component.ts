import { Component } from '@angular/core';

import { RevealDirective } from '../shared/reveal.directive';

interface SkillCategory {
  title: string;
  summary: string;
  skills: string[];
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [RevealDirective],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
})
export class SkillsComponent {
  protected readonly categories: SkillCategory[] = [
    {
      title: 'Programming & Frontend',
      summary: 'Languages and frontend technologies for web, desktop, and mobile development.',
      skills: ['C++', 'C#', 'HTML5', 'CSS3', 'JavaScript', 'TypeScript', 'Angular', 'Dart', 'Flutter'],
    },
    {
      title: 'Databases',
      summary: 'Database and backend data platforms used in projects.',
      skills: ['MySQL', 'Firebase'],
    },
    {
      title: 'Development Tools',
      summary: 'Tools for source control, containers, and daily development.',
      skills: ['Git', 'Docker', 'Visual Studio', 'VS Code', 'WebStorm'],
    },
  ];
}
