import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

import { ScrollRevealDirective } from '../shared/scroll-reveal.directive';

interface Skill {
  label: string;
  icon: string;
  iconType?: 'material' | 'image';
}

interface SkillCategory {
  title: string;
  summary: string;
  skills: Skill[];
}

@Component({
  selector: 'app-skills',
  standalone: true,
  imports: [CommonModule, MatIconModule, MatTabsModule, ScrollRevealDirective],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
})
export class SkillsComponent {
  protected readonly categories: SkillCategory[] = [
    {
      title: 'Programming & Frontend',
      summary: 'Languages and frontend technologies for web, desktop, and mobile development.',
      skills: [
        { label: 'C++', icon: 'code' },
        { label: 'C#', icon: 'data_object' },
        { label: 'HTML5', icon: 'html' },
        { label: 'CSS3', icon: 'css' },
        { label: 'JavaScript', icon: 'javascript' },
        { label: 'TypeScript', icon: 'integration_instructions' },
        { label: 'Angular', icon: 'view_quilt' },
        { label: 'Dart', icon: 'flutter_dash' },
        { label: 'Flutter', icon: 'phone_iphone' },
      ],
    },
    {
      title: 'Databases',
      summary: 'Database and backend data platforms used in projects.',
      skills: [
        { label: 'MySQL', icon: 'storage' },
        { label: 'Firebase', icon: 'local_fire_department' },
      ],
    },
    {
      title: 'Development Tools',
      summary: 'Tools for source control, containers, and daily development.',
      skills: [
        { label: 'Git', icon: 'account_tree' },
        { label: 'Docker', icon: 'images/docker-icon.svg', iconType: 'image' },
        { label: 'Visual Studio', icon: 'terminal' },
        { label: 'VS Code', icon: 'code_blocks' },
        { label: 'WebStorm', icon: 'web_asset' },
      ],
    },
  ];
}
