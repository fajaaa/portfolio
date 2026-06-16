import { Injectable } from '@angular/core';

export interface Project {
  title: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  demoUrl: string;
  imageUrl: string;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private readonly projects: Project[] = [
    {
      title: 'SaaS Analytics Dashboard',
      description: 'A full-stack dashboard with role-based access, KPI tracking, and realtime chart updates.',
      techStack: ['Angular', 'Node.js', 'PostgreSQL', 'RxJS'],
      githubUrl: 'https://github.com/',
      demoUrl: 'https://example.com/',
      imageUrl: '',
    },
    {
      title: 'E-Commerce Platform',
      description: 'Product catalog, checkout flow, admin inventory tools, and secure payment integration.',
      techStack: ['Angular Material', 'Express', 'MongoDB', 'Stripe'],
      githubUrl: 'https://github.com/',
      demoUrl: 'https://example.com/',
      imageUrl: '',
    },
    {
      title: 'Project Management API',
      description: 'REST API and responsive client for teams, tasks, activity logs, and sprint planning.',
      techStack: ['TypeScript', 'NestJS', 'Prisma', 'Docker'],
      githubUrl: 'https://github.com/',
      demoUrl: 'https://example.com/',
      imageUrl: '',
    },
    {
      title: 'Portfolio CMS',
      description: 'A content-managed portfolio system with markdown editing and preview publishing workflow.',
      techStack: ['Angular', 'Firebase', 'SCSS', 'Auth'],
      githubUrl: 'https://github.com/',
      demoUrl: 'https://example.com/',
      imageUrl: '',
    },
    {
      title: 'Realtime Chat App',
      description: 'Socket-based messaging with channels, presence indicators, and optimistic UI updates.',
      techStack: ['Angular', 'Socket.io', 'Node.js', 'Redis'],
      githubUrl: 'https://github.com/',
      demoUrl: 'https://example.com/',
      imageUrl: '',
    },
    {
      title: 'Developer Toolkit',
      description: 'A collection of productivity tools for formatting JSON, testing APIs, and sharing snippets.',
      techStack: ['Angular', 'Web Workers', 'IndexedDB', 'PWA'],
      githubUrl: 'https://github.com/',
      demoUrl: 'https://example.com/',
      imageUrl: '',
    },
  ];

  getProjects(): Project[] {
    return this.projects;
  }
}
