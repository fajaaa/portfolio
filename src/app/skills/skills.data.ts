import type { I18nKey } from '../i18n/i18n.types';

/*
 * KENAN, PLEASE EDIT: `rarity` below is an INITIAL GUESS.
 *   rarity = how strong the skill is (common < rare < epic < legendary).
 *   usedIn = project names shown under "Used in:" (an empty list is fine), taken from the
 *            projects' READMEs and code on GitHub.
 *
 * Adding a skill: add an entry to SKILLS, a 16x16 icon in `skill-icons.ts` (same id) and a
 * description under `skills.items.<id>` in both `i18n/en.ts` and `i18n/bs.ts`.
 * The roster is a 5-column grid, so 25 skills fill it exactly.
 */

export type SkillType =
  'language' | 'framework' | 'database' | 'tool' | 'architecture' | 'hardware';
export type SkillRarity = 'common' | 'rare' | 'epic' | 'legendary';

export type SkillId =
  | 'cpp'
  | 'csharp'
  | 'javascript'
  | 'typescript'
  | 'dart'
  | 'sql'
  | 'html5'
  | 'css3'
  | 'angular'
  | 'flutter'
  | 'aspnet'
  | 'efcore'
  | 'restapi'
  | 'mysql'
  | 'sqlserver'
  | 'sqlite'
  | 'firebase'
  | 'redis'
  | 'git'
  | 'github'
  | 'docker'
  | 'visualstudio'
  | 'vscode'
  | 'webstorm'
  | 'esp32';

export interface Skill {
  readonly id: SkillId;
  /** Product name: shown as-is in both languages. */
  readonly label: string;
  readonly type: SkillType;
  readonly rarity: SkillRarity;
  readonly descriptionKey: I18nKey;
  readonly usedIn: readonly string[];
}

/** Rarity as a 1-4 level, for the LEVEL meter. */
export const RARITY_LEVEL: Readonly<Record<SkillRarity, number>> = {
  common: 1,
  rare: 2,
  epic: 3,
  legendary: 4,
};

export const MAX_LEVEL = 4;

const PORTFOLIO = 'Portfolio';
const AQUA_FLOW = 'AquaFlow';
const AQUA_CONTROL = 'AquaControl';
const SMART_SAFE = 'IOT-project-smart-safe';

const skill = (
  id: SkillId,
  label: string,
  type: SkillType,
  rarity: SkillRarity,
  usedIn: readonly string[] = [],
): Skill => ({ id, label, type, rarity, descriptionKey: `skills.items.${id}`, usedIn });

/** Every skill, in roster order (left to right, top to bottom). */
export const SKILLS: readonly Skill[] = [
  skill('typescript', 'TypeScript', 'language', 'legendary', [PORTFOLIO]),
  skill('angular', 'Angular', 'framework', 'legendary', [PORTFOLIO]),
  skill('javascript', 'JavaScript', 'language', 'epic', [SMART_SAFE]),
  skill('html5', 'HTML5', 'language', 'epic', [PORTFOLIO, SMART_SAFE]),
  skill('css3', 'CSS3', 'language', 'epic', [PORTFOLIO, SMART_SAFE]),

  skill('csharp', 'C#', 'language', 'epic', [AQUA_FLOW, AQUA_CONTROL]),
  skill('aspnet', 'ASP.NET Core', 'framework', 'rare', [AQUA_FLOW]),
  skill('efcore', 'Entity Framework', 'framework', 'rare', [AQUA_FLOW, AQUA_CONTROL]),
  skill('restapi', 'REST API', 'architecture', 'epic', [AQUA_FLOW]),
  skill('cpp', 'C++', 'language', 'rare', [SMART_SAFE]),

  skill('sql', 'SQL', 'language', 'epic', [AQUA_FLOW, AQUA_CONTROL]),
  skill('mysql', 'MySQL', 'database', 'rare'),
  skill('sqlserver', 'SQL Server', 'database', 'rare', [AQUA_FLOW]),
  skill('sqlite', 'SQLite', 'database', 'common', [AQUA_CONTROL]),
  skill('redis', 'Redis', 'database', 'common'),

  skill('dart', 'Dart', 'language', 'rare', [AQUA_FLOW]),
  skill('flutter', 'Flutter', 'framework', 'rare', [AQUA_FLOW]),
  skill('firebase', 'Firebase', 'database', 'rare', [AQUA_FLOW, SMART_SAFE]),
  skill('esp32', 'ESP32', 'hardware', 'rare'),
  skill('docker', 'Docker', 'tool', 'common', [AQUA_FLOW]),

  skill('git', 'Git', 'tool', 'epic', [PORTFOLIO, AQUA_FLOW, AQUA_CONTROL, SMART_SAFE]),
  skill('github', 'GitHub', 'tool', 'epic', [PORTFOLIO, AQUA_FLOW, AQUA_CONTROL, SMART_SAFE]),
  skill('vscode', 'VS Code', 'tool', 'epic'),
  skill('visualstudio', 'Visual Studio', 'tool', 'rare', [AQUA_CONTROL]),
  skill('webstorm', 'WebStorm', 'tool', 'common'),
];
