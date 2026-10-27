# Kenan Fajic: The Game

My portfolio as a retro 8/16-bit pixel-art game: scrolling moves you through five worlds, each a
section of the site.

**Live:** <https://fajaaa.github.io/portfolio/>

| World | Section  | What it is                                                                  |
| ----- | -------- | --------------------------------------------------------------------------- |
| –     | Intro    | First visit only: PRESS START screen, loading bar, language and sound pick  |
| 1-1   | Home     | Three.js voxel island (Kenan typing at his computer), name, typing subtitle |
| 1-2   | About    | RPG character sheet: pixel portrait, stats, bio, "LOOT: CV.PDF"             |
| 1-3   | Projects | GitHub repositories as game cartridges; insert one to open its game screen  |
| 1-4   | Skills   | RPG inventory: bags per category, 16×16 item icons, item info               |
| 1-5   | Contact  | NPC dialogue that builds an email step by step, plus FAST TRAVEL links      |
| –     | 404      | GAME OVER, CONTINUE? with a countdown                                       |

Also: a HUD with an XP bar that fills as you scroll, LEVEL UP! toasts, English / Bosnian with a
runtime switch, 8-bit sounds synthesized with Web Audio (muted by default) and a Konami code
easter egg (↑↑↓↓←→←→BA, or tap the HUD logo 5× on mobile).

## Tech

Angular 20 (standalone components, signals), GSAP + ScrollTrigger, Lenis smooth scroll and
three.js for the hero (in its own lazy chunk). All pixel art (icons, covers, backgrounds, sprites)
is drawn in code: string grids rendered as SVG or CSS. There are no sprite images.

Accessibility: everything works by keyboard, focus is always visible, text meets WCAG AA and
`prefers-reduced-motion` turns the site static (no Lenis, no entrances, one still frame of the
island).

## Run it

```bash
npm install
npm start                    # dev server on http://localhost:4200
npm run build                # production build into dist/portfolio/browser
npm test -- --watch=false    # unit tests (needs Chrome)
```

`/styleguide` (all UI primitives on one page) exists in dev builds only.

## Deploy

```bash
npx ng deploy
```

This builds for production and pushes `dist/portfolio/browser` to the `gh-pages` branch with
angular-cli-ghpages. The base href `/portfolio/` is set in `angular.json` (deploy options), and
the tool copies `index.html` to `404.html`, so deep links like `/portfolio/404` work on GitHub
Pages. Keep asset links relative (`Kenan-CV.pdf`, not `/Kenan-CV.pdf`) or they break under
`/portfolio/`.

## Editing content

### Text and translations: `src/app/i18n/en.ts`, `src/app/i18n/bs.ts`

Every word on the site lives here. `en.ts` defines the keys; `bs.ts` must have exactly the same
shape (TypeScript reports a missing or extra key). Bosnian is written in ijekavica. Game terms stay
English in both files: PRESS START, LEVEL / LV, LEVEL UP!, GAME OVER, CONTINUE?, INSERT COIN,
WORLD 1-x, HP/XP.

- `{name}` placeholders are filled in by the code (e.g. `'LV {level}/{total}'`).
- Counts have `one` / `few` / `other` forms (Bosnian: 1 igra, 2 igre, 5 igara).
- `meta.description` is the search / social description; the English copy in `src/index.html`
  is what link previews show, so update both.

### The voxel island: `src/app/hero/voxel/island-model.ts`

The island, tree, desk and Kenan are plain text layer maps; the instructions are at the top of the
file. Each character is one voxel, coloured through `PALETTE`. The fallback SVG (shown while
three.js loads, or without WebGL) is drawn from the same data. `island-model.spec.ts` checks that
the rows line up.

### Project cartridges: `src/app/projects/`

- Projects come live from the GitHub API (`projects.service.ts`): forks and this repository are
  skipped, and built-in fallback projects show if the API fails.
- Better descriptions for a repository: add it to `projectDescriptionOverrides` in
  `projects.service.ts` and the text under `projects.descriptions` in both language files.
- Cover art: `covers/covers.ts` is the registry, keyed by repository name. Add a
  `<name>.cover.ts` (24 rows × 32 characters plus a palette; see `aqua-control.cover.ts`) and
  register it. Repositories without a cover get a generated one.

### Skills: `src/app/skills/skills.data.ts` and `skill-icons.ts`

- `skills.data.ts`: the items, their bag, type, **rarity** (common < rare < epic < legendary) and
  **usedIn** (project names). Rarity and usedIn are still my first guesses; adjust them.
- `skill-icons.ts`: a 16×16 icon per skill (`.` is transparent).
- A new skill needs an entry in `SKILLS`, an icon with the same id, and a description under
  `skills.items.<id>` in both language files. The specs check icon sizes and palettes.

### About stats, contact links, CV

- Stat bars (projects, mentorship months, areas): `stats` in `src/app/about/about.component.ts`.
- FAST TRAVEL links (email, LinkedIn, GitHub, CV): `src/app/contact/fast-travel/fast-travel.component.ts`.
- The CV is `public/Kenan-CV.pdf`. Replace the file and keep the name; all three download
  buttons link to it.
- Photo: `public/images/kenan-avatar.jfif` (the pixelated portrait in About).

### Social preview image: `public/og-image.png`

The 1200×630 image shown when the link is shared. It is a static PNG; if the name, role or look
changes, replace it with an image of the same size.
