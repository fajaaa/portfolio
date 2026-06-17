import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { animate, state, style, transition, trigger } from '@angular/animations';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';

import { ScrollRevealDirective } from '../shared/scroll-reveal.directive';

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
  imports: [CommonModule, MatIconModule, MatTabsModule, ScrollRevealDirective],
  templateUrl: './skills.component.html',
  styleUrl: './skills.component.scss',
  animations: [
    trigger('skillBar', [
      state('hidden', style({ width: '0%' })),
      state('visible', style({ width: '{{ level }}%' }), { params: { level: 0 } }),
      transition('hidden => visible', animate('850ms 180ms cubic-bezier(0.22, 1, 0.36, 1)')),
    ]),
  ],
})
export class SkillsComponent {
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

  protected revealSkills(): void {
    this.isVisible = true;
  }
}
