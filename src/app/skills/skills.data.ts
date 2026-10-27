import type { I18nKey } from '../i18n/i18n.types';

/*
 * KENAN, PLEASE EDIT: `rarity` and `usedIn` below are INITIAL GUESSES.
 *   rarity = how strong the skill is (common < rare < epic < legendary).
 *   usedIn = project names shown under "Used in:" (an empty list is fine).
 *
 * Adding a skill: add an entry to SKILLS, a 16x16 icon in `skill-icons.ts` (same id) and a
 * description under `skills.items.<id>` in both `i18n/en.ts` and `i18n/bs.ts`.
 */

export type SkillType = 'language' | 'framework' | 'database' | 'tool';
export type SkillRarity = 'common' | 'rare' | 'epic' | 'legendary';
export type SkillCategoryId = 'programming' | 'databases' | 'tools';

export type SkillId =
  | 'cpp'
  | 'csharp'
  | 'html5'
  | 'css3'
  | 'javascript'
  | 'typescript'
  | 'angular'
  | 'dart'
  | 'flutter'
  | 'mysql'
  | 'firebase'
  | 'git'
  | 'docker'
  | 'visualstudio'
  | 'vscode'
  | 'webstorm';

export interface Skill {
  readonly id: SkillId;
  /** Product name: shown as-is in both languages. */
  readonly label: string;
  readonly category: SkillCategoryId;
  readonly type: SkillType;
  readonly rarity: SkillRarity;
  readonly descriptionKey: I18nKey;
  readonly usedIn: readonly string[];
}

export interface SkillCategory {
  readonly id: SkillCategoryId;
  /** Short bag name for the tab. */
  readonly bagKey: I18nKey;
  readonly titleKey: I18nKey;
  readonly summaryKey: I18nKey;
}

/** The inventory bags, in tab order. */
export const SKILL_CATEGORIES: readonly SkillCategory[] = [
  {
    id: 'programming',
    bagKey: 'skills.categories.programming.bag',
    titleKey: 'skills.categories.programming.title',
    summaryKey: 'skills.categories.programming.summary',
  },
  {
    id: 'databases',
    bagKey: 'skills.categories.databases.bag',
    titleKey: 'skills.categories.databases.title',
    summaryKey: 'skills.categories.databases.summary',
  },
  {
    id: 'tools',
    bagKey: 'skills.categories.tools.bag',
    titleKey: 'skills.categories.tools.title',
    summaryKey: 'skills.categories.tools.summary',
  },
];

const PORTFOLIO = 'Portfolio';
const AQUA_CONTROL = 'AquaControl';
const SMART_SAFE = 'IOT-project-smart-safe';

/** Every skill, in slot order within its bag. */
export const SKILLS: readonly Skill[] = [
  // Programming & frontend
  {
    id: 'cpp',
    label: 'C++',
    category: 'programming',
    type: 'language',
    rarity: 'rare',
    descriptionKey: 'skills.items.cpp',
    usedIn: [],
  },
  {
    id: 'csharp',
    label: 'C#',
    category: 'programming',
    type: 'language',
    rarity: 'epic',
    descriptionKey: 'skills.items.csharp',
    usedIn: [AQUA_CONTROL],
  },
  {
    id: 'html5',
    label: 'HTML5',
    category: 'programming',
    type: 'language',
    rarity: 'epic',
    descriptionKey: 'skills.items.html5',
    usedIn: [PORTFOLIO],
  },
  {
    id: 'css3',
    label: 'CSS3',
    category: 'programming',
    type: 'language',
    rarity: 'epic',
    descriptionKey: 'skills.items.css3',
    usedIn: [PORTFOLIO],
  },
  {
    id: 'javascript',
    label: 'JavaScript',
    category: 'programming',
    type: 'language',
    rarity: 'epic',
    descriptionKey: 'skills.items.javascript',
    usedIn: [SMART_SAFE],
  },
  {
    id: 'typescript',
    label: 'TypeScript',
    category: 'programming',
    type: 'language',
    rarity: 'legendary',
    descriptionKey: 'skills.items.typescript',
    usedIn: [PORTFOLIO],
  },
  {
    id: 'angular',
    label: 'Angular',
    category: 'programming',
    type: 'framework',
    rarity: 'legendary',
    descriptionKey: 'skills.items.angular',
    usedIn: [PORTFOLIO],
  },
  {
    id: 'dart',
    label: 'Dart',
    category: 'programming',
    type: 'language',
    rarity: 'rare',
    descriptionKey: 'skills.items.dart',
    usedIn: [],
  },
  {
    id: 'flutter',
    label: 'Flutter',
    category: 'programming',
    type: 'framework',
    rarity: 'rare',
    descriptionKey: 'skills.items.flutter',
    usedIn: [],
  },

  // Databases
  {
    id: 'mysql',
    label: 'MySQL',
    category: 'databases',
    type: 'database',
    rarity: 'rare',
    descriptionKey: 'skills.items.mysql',
    usedIn: [],
  },
  {
    id: 'firebase',
    label: 'Firebase',
    category: 'databases',
    type: 'database',
    rarity: 'rare',
    descriptionKey: 'skills.items.firebase',
    usedIn: [],
  },

  // Development tools
  {
    id: 'git',
    label: 'Git',
    category: 'tools',
    type: 'tool',
    rarity: 'epic',
    descriptionKey: 'skills.items.git',
    usedIn: [PORTFOLIO, AQUA_CONTROL, SMART_SAFE],
  },
  {
    id: 'docker',
    label: 'Docker',
    category: 'tools',
    type: 'tool',
    rarity: 'common',
    descriptionKey: 'skills.items.docker',
    usedIn: [],
  },
  {
    id: 'visualstudio',
    label: 'Visual Studio',
    category: 'tools',
    type: 'tool',
    rarity: 'rare',
    descriptionKey: 'skills.items.visualstudio',
    usedIn: [AQUA_CONTROL],
  },
  {
    id: 'vscode',
    label: 'VS Code',
    category: 'tools',
    type: 'tool',
    rarity: 'epic',
    descriptionKey: 'skills.items.vscode',
    usedIn: [],
  },
  {
    id: 'webstorm',
    label: 'WebStorm',
    category: 'tools',
    type: 'tool',
    rarity: 'common',
    descriptionKey: 'skills.items.webstorm',
    usedIn: [],
  },
];
