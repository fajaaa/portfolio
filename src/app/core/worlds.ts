import { I18nKey } from '../i18n/i18n.types';

export type SectionId = 'home' | 'about' | 'projects' | 'skills' | 'contact';
export type WorldId = '1-1' | '1-2' | '1-3' | '1-4' | '1-5';

export interface World {
  readonly id: WorldId;
  readonly section: SectionId;
  readonly labelKey: I18nKey;
}

/** The page's sections in scroll order; each one is a game world (LV = index + 1). */
export const WORLDS: readonly World[] = [
  { id: '1-1', section: 'home', labelKey: 'nav.links.home' },
  { id: '1-2', section: 'about', labelKey: 'nav.links.about' },
  { id: '1-3', section: 'projects', labelKey: 'nav.links.projects' },
  { id: '1-4', section: 'skills', labelKey: 'nav.links.skills' },
  { id: '1-5', section: 'contact', labelKey: 'nav.links.contact' },
];
