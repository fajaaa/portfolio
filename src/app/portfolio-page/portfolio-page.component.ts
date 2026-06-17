import { Component } from '@angular/core';

import { AboutComponent } from '../about/about.component';
import { ContactComponent } from '../contact/contact.component';
import { HeroComponent } from '../hero/hero.component';
import { ProjectsComponent } from '../projects/projects.component';
import { SkillsComponent } from '../skills/skills.component';

@Component({
  selector: 'app-portfolio-page',
  standalone: true,
  imports: [HeroComponent, AboutComponent, ProjectsComponent, SkillsComponent, ContactComponent],
  templateUrl: './portfolio-page.component.html',
})
export class PortfolioPageComponent {}
