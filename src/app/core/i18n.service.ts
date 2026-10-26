import { DOCUMENT } from '@angular/common';
import { Injectable, inject, signal } from '@angular/core';

import { bs } from '../i18n/bs';
import { en } from '../i18n/en';
import {
  Dictionary,
  I18nKey,
  I18nListKey,
  I18nParams,
  LANGS,
  Lang,
} from '../i18n/i18n.types';

const STORAGE_KEY = 'kf.lang';
const DICTIONARIES: Record<Lang, Dictionary> = { en, bs };

/**
 * Runtime translations: `lang` is a signal, so templates (via the `t` pipe) and computeds that
 * call `t()` / `list()` update instantly when it changes. Missing entries fall back to English.
 */
@Injectable({ providedIn: 'root' })
export class I18nService {
  private readonly document = inject(DOCUMENT);
  private readonly current = signal<Lang>(this.initialLang());

  readonly lang = this.current.asReadonly();

  constructor() {
    this.document.documentElement.lang = this.current();
  }

  setLang(lang: Lang): void {
    this.current.set(lang);
    this.document.documentElement.lang = lang;

    try {
      localStorage.setItem(STORAGE_KEY, lang);
    } catch {
      // Storage blocked (private mode etc.): the choice just lasts for this visit.
    }
  }

  /** Translates `key`, replacing `{name}` placeholders with `params`. */
  t(key: I18nKey, params?: I18nParams): string {
    const value = this.lookup(key);
    const text = typeof value === 'string' ? value : key;

    return params
      ? text.replace(/\{(\w+)\}/g, (match, name: string) => String(params[name] ?? match))
      : text;
  }

  /** Returns a translated list, e.g. the hero subtitles. */
  list(key: I18nListKey): readonly string[] {
    const value = this.lookup(key);

    return Array.isArray(value) ? value : [];
  }

  private lookup(key: string): unknown {
    const value = resolve(DICTIONARIES[this.current()], key);

    return value === undefined ? resolve(en, key) : value;
  }

  private initialLang(): Lang {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);

      if (LANGS.includes(stored as Lang)) {
        return stored as Lang;
      }
    } catch {
      // Fall through to the browser language.
    }

    const browserLang = typeof navigator === 'undefined' ? '' : navigator.language.toLowerCase();

    return /^(bs|hr|sr)\b/.test(browserLang) ? 'bs' : 'en';
  }
}

function resolve(dictionary: unknown, key: string): unknown {
  return key
    .split('.')
    .reduce<unknown>(
      (node, part) =>
        node !== null && typeof node === 'object' ? (node as Record<string, unknown>)[part] : undefined,
      dictionary,
    );
}
