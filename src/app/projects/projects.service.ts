import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { catchError, EMPTY, expand, map, Observable, of, reduce, shareReplay } from 'rxjs';

import { I18nKey } from '../i18n/i18n.types';

export interface Project {
  title: string;
  /** Translated description that replaces the GitHub one. */
  descriptionKey?: I18nKey;
  /** GitHub description, untranslated; empty when the repository has none. */
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

/** Hand-written details for known repositories, keyed by repository name. */
interface ProjectDetails {
  /** Translated description that replaces the GitHub one. */
  descriptionKey: I18nKey;
  /** Curated stack, most important first; replaces the GitHub language and topics. */
  techStack: string[];
}

const PROJECT_DETAILS: Readonly<Record<string, ProjectDetails>> = {
  AquaFlow: {
    descriptionKey: 'projects.descriptions.aquaFlow',
    techStack: [
      'ASP.NET Core',
      'Flutter',
      'SQL Server',
      'EF Core',
      'RabbitMQ',
      'Docker',
      'Firebase',
      'Stripe',
    ],
  },
  AquaControl: {
    descriptionKey: 'projects.descriptions.aquaControl',
    techStack: ['C#', 'WinForms', 'EF Core', 'SQLite'],
  },
  'IOT-project-smart-safe': {
    descriptionKey: 'projects.descriptions.smartSafe',
    techStack: ['NodeMCU', 'Arduino', 'Firebase', 'JavaScript'],
  },
};

/** Display names for GitHub topics that title case gets wrong ("aspnet-core" -> "ASP.NET Core"). */
const TOPIC_LABELS: Readonly<Record<string, string>> = {
  'aspnet-core': 'ASP.NET Core',
  'sql-server': 'SQL Server',
  rabbitmq: 'RabbitMQ',
  iot: 'IoT',
  'internet-of-things': 'IoT',
  'nodemcu-esp32': 'ESP32',
  javascript: 'JavaScript',
  typescript: 'TypeScript',
};

@Injectable({
  providedIn: 'root',
})
export class ProjectsService {
  private readonly http = inject(HttpClient);
  private readonly githubReposUrl = 'https://api.github.com/users/fajaaa/repos';
  private readonly excludedRepositoryNames = new Set(['portfolio']);
  /** Shown when the GitHub API fails (offline, rate limit): the known projects, newest first. */
  private readonly fallbackProjects: Project[] = [
    'AquaFlow',
    'AquaControl',
    'IOT-project-smart-safe',
  ].map((name) => {
    const url = `https://github.com/fajaaa/${name}`;

    return {
      title: name,
      descriptionKey: PROJECT_DETAILS[name].descriptionKey,
      description: '',
      techStack: PROJECT_DETAILS[name].techStack,
      githubUrl: url,
      demoUrl: url,
      imageUrl: '',
    };
  });

  private readonly projects$ = this.getRepositoryPage().pipe(
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
      descriptionKey: PROJECT_DETAILS[repository.name]?.descriptionKey,
      description: repository.description?.trim() ?? '',
      techStack: this.toTechStack(repository),
      githubUrl: repository.html_url,
      demoUrl: homepage || repository.html_url,
      imageUrl: '',
    };
  }

  private toTechStack(repository: GitHubRepository): string[] {
    const curated = PROJECT_DETAILS[repository.name]?.techStack;

    if (curated) {
      return curated;
    }

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
    return (
      TOPIC_LABELS[topic] ??
      topic
        .split(/[-_]/)
        .filter(Boolean)
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ')
    );
  }
}
