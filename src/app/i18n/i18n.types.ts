import type { en } from './en';

export const LANGS = ['en', 'bs'] as const;
export type Lang = (typeof LANGS)[number];

/** Same shape as T, with every string literal widened to `string` (lists to `readonly string[]`). */
export type DeepString<T> = T extends string
  ? string
  : T extends readonly string[]
    ? readonly string[]
    : { readonly [K in keyof T]: DeepString<T[K]> };

/** The shape every dictionary must match exactly. */
export type Dictionary = DeepString<typeof en>;

/** Dot paths into T whose value extends V, e.g. `'hero.start'`. */
type PathsTo<T, V> = {
  [K in keyof T & string]: T[K] extends V
    ? K
    : T[K] extends string | readonly unknown[]
      ? never
      : `${K}.${PathsTo<T[K], V>}`;
}[keyof T & string];

export type I18nKey = PathsTo<typeof en, string>;
export type I18nListKey = PathsTo<typeof en, readonly string[]>;

/**
 * Count-dependent text: `one` (1, 21, 31...), `few` (2-4, 22-24... in Bosnian) and `other`.
 * English only uses `one` and `other`; its `few` repeats `other`.
 */
export interface PluralForms {
  readonly one: string;
  readonly few: string;
  readonly other: string;
}

export type I18nPluralKey = PathsTo<typeof en, PluralForms>;
export type I18nParams = Readonly<Record<string, string | number>>;
