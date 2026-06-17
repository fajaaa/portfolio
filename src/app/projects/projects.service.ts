import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { catchError, EMPTY, expand, map, Observable, of, reduce, shareReplay } from 'rxjs';

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
  private readonly excludedRepositoryNames = new Set(['portfolio']);
  private readonly projectDescriptionOverrides = new Map<string, string>([
    [
      'AquaControl',
      'A desktop application for water consumption and billing records, including customer management, monthly usage entry, automatic bill calculation, payments, debts, and reports.',
    ],
    [
      'IOT-project-smart-safe',
      'An IoT smart safe simulation with remote control, security code generation, and real-time device status monitoring.',
    ],
  ]);
  private readonly fallbackProjects: Project[] = [
    {
      title: 'AquaControl',
      description:
        'A desktop application for water consumption and billing records, including customer management, monthly usage entry, automatic bill calculation, payments, debts, and reports.',
      techStack: ['C#'],
      githubUrl: 'https://github.com/fajaaa/AquaControl',
      demoUrl: 'https://github.com/fajaaa/AquaControl',
      imageUrl: '',
    },
    {
      title: 'IOT-project-smart-safe',
      description:
        'An IoT smart safe simulation with remote control, security code generation, and real-time device status monitoring.',
      techStack: ['JavaScript'],
      githubUrl: 'https://github.com/fajaaa/IOT-project-smart-safe',
      demoUrl: 'https://github.com/fajaaa/IOT-project-smart-safe',
      imageUrl: '',
    },
  ];

  private readonly projects$ = this.getRepositoryPage()
    .pipe(
      expand((response) => {
        const nextPage = this.getNextPage(response.headers.get('Link'));

        return nextPage ? this.getRepositoryPage(nextPage) : EMPTY;
      }),
      map((response) => response.body ?? []),
      reduce(
        (repositories, pageRepositories) => [...repositories, ...pageRepositories],
        [] as GitHubRepository[],
      ),
      map((repositories) =>
        repositories
          .filter((repository) => this.shouldShowRepository(repository))
          .map((repository) => this.toProject(repository)),
      ),
      catchError(() => of(this.fallbackProjects)),
      shareReplay({ bufferSize: 1, refCount: true }),
    );

  getProjects(): Observable<Project[]> {
    return this.projects$;
  }

  private getRepositoryPage(page = 1): Observable<HttpResponse<GitHubRepository[]>> {
    return this.http.get<GitHubRepository[]>(this.githubReposUrl, {
      observe: 'response',
      params: {
        sort: 'updated',
        direction: 'desc',
        per_page: 100,
        page,
      },
      headers: {
        Accept: 'application/vnd.github+json',
      },
    });
  }

  private shouldShowRepository(repository: GitHubRepository): boolean {
    return !repository.fork && !this.excludedRepositoryNames.has(repository.name.toLowerCase());
  }

  private getNextPage(linkHeader: string | null): number | null {
    if (!linkHeader) {
      return null;
    }

    const nextLink = linkHeader
      .split(',')
      .map((link) => link.trim())
      .find((link) => link.endsWith('rel="next"'));
    const page = nextLink?.match(/[?&]page=(\d+)/)?.[1];

    return page ? Number(page) : null;
  }

  private toProject(repository: GitHubRepository): Project {
    const homepage = repository.homepage?.trim();

    return {
      title: repository.name,
      description:
        this.projectDescriptionOverrides.get(repository.name) ??
        repository.description ??
        'Public GitHub repository from the fajaaa profile.',
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
