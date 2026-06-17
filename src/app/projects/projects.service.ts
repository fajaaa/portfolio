import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError, map, Observable, of, shareReplay } from 'rxjs';

export interface Project {
  title: string;
  description: string;
  techStack: string[];
  githubUrl: string;
  demoUrl: string;
  imageUrl: string;
}

interface GitHubRepository {
  name: string;
  description: string | null;
  html_url: string;
  homepage: string | null;
  language: string | null;
  topics?: string[];
  fork: boolean;
}

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private readonly http = inject(HttpClient);
  private readonly githubReposUrl = 'https://api.github.com/users/fajaaa/repos';
  private readonly fallbackProjects: Project[] = [
    {
      title: 'AquaControl',
      description:
        'Desktop aplikacija za evidenciju potrosnje i naplate vode, korisnike, racune, uplate i dugovanja.',
      techStack: ['C#'],
      githubUrl: 'https://github.com/fajaaa/AquaControl',
      demoUrl: 'https://github.com/fajaaa/AquaControl',
      imageUrl: '',
    },
    {
      title: 'IOT-project-smart-safe',
      description: 'Jednostavna simulacija pametnog sefa razvijena kao dio fakultetskih obaveza.',
      techStack: ['JavaScript'],
      githubUrl: 'https://github.com/fajaaa/IOT-project-smart-safe',
      demoUrl: 'https://github.com/fajaaa/IOT-project-smart-safe',
      imageUrl: '',
    },
  ];

  private readonly projects$ = this.http
    .get<GitHubRepository[]>(this.githubReposUrl, {
      params: {
        sort: 'updated',
        direction: 'desc',
        per_page: 6,
      },
      headers: {
        Accept: 'application/vnd.github+json',
      },
    })
    .pipe(
      map((repositories) =>
        repositories.filter((repository) => !repository.fork).map((repository) => this.toProject(repository)),
      ),
      catchError(() => of(this.fallbackProjects)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

  getProjects(): Observable<Project[]> {
    return this.projects$;
  }

  private toProject(repository: GitHubRepository): Project {
    const homepage = repository.homepage?.trim();

    return {
      title: repository.name,
      description: repository.description ?? 'Public GitHub repository from the fajaaa profile.',
      techStack: this.toTechStack(repository),
      githubUrl: repository.html_url,
      demoUrl: homepage || repository.html_url,
      imageUrl: '',
    };
  }

  private toTechStack(repository: GitHubRepository): string[] {
    const techStack = new Set<string>();

    if (repository.language) {
      techStack.add(repository.language);
    }

    for (const topic of repository.topics ?? []) {
      if (techStack.size >= 4) {
        break;
      }

      techStack.add(this.formatTopic(topic));
    }

    return techStack.size > 0 ? Array.from(techStack) : ['GitHub'];
  }

  private formatTopic(topic: string): string {
    return topic
      .split(/[-_]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(' ');
  }
}
