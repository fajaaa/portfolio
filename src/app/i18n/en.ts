export const en = {
  meta: {
    title: {
      home: 'Kenan Fajic',
      notFound: 'Page not found',
      styleguide: 'Styleguide',
    },
  },
  nav: {
    ariaLabel: 'Primary navigation',
    toggleMenu: 'Open menu',
    links: {
      home: 'Home',
      about: 'About',
      projects: 'Projects',
      skills: 'Skills',
      contact: 'Contact',
    },
    language: {
      label: 'Language',
      en: 'English',
      bs: 'Bosanski',
    },
  },
  backToTop: 'Back to start',
  hud: {
    world: 'WORLD {world}',
    level: 'LV {level}/{total}',
    xpLabel: 'Page progress',
    levelUp: 'LEVEL UP!',
    pause: {
      title: 'PAUSE MENU',
      close: 'Close menu',
      hint: '↑ ↓ select · Enter confirm · Esc close',
    },
  },
  hero: {
    player: 'PLAYER 1',
    subtitles: ['Full-Stack Developer', 'Angular Enthusiast', 'Problem Solver'],
    intro:
      'Final-year Software Engineering student at FIT Mostar. I build useful apps and earn XP with every project.',
    start: 'START',
    cv: 'Download CV',
    scroll: 'SCROLL',
    sceneLabel:
      'Voxel island: a tiny Kenan typing at his computer, with a tree, a waterfall, clouds and birds',
    greetings: ['Hi! Welcome to my world.', 'Hey, player 1!', 'Back to coding...'],
  },
  about: {
    sheetTitle: 'CHARACTER SHEET',
    heading: 'Software Engineering student learning by building real projects.',
    bio: 'I am a final-year Software Engineering student at FIT Mostar. I enjoy building useful applications, learning new technologies, and improving my skills through practical projects.',
    portrait: {
      alt: 'Portrait photo of Kenan Fajic',
      toggle: 'Show real photo',
    },
    header: {
      name: 'NAME',
      class: 'CLASS',
      classValue: 'Software Engineer (student)',
      level: 'LV',
      levelValue: 'Final year',
    },
    attributes: {
      origin: 'ORIGIN',
      originValue: 'Lukavac, BiH',
      guild: 'GUILD',
      guildValue: 'FIT Mostar – Software Engineering',
      languages: 'LANGUAGES',
      languagesValue: 'English, Bosnian',
    },
    stats: {
      title: 'STATS',
      projects: 'Self-Initiated Projects',
      mentorship: 'Mentorship Months',
      areas: 'Technical Areas',
    },
    cv: {
      loot: 'LOOT: CV.PDF',
      hint: 'Download CV',
    },
  },
  projects: {
    heading: 'SELECT A GAME',
    count: {
      one: '{count} GAME FOUND',
      few: '{count} GAMES FOUND',
      other: '{count} GAMES FOUND',
    },
    loading: 'LOADING…',
    empty: 'The cartridge shelf is empty: no public GitHub repositories found.',
    defaultDescription: 'Public GitHub repository from the fajaaa profile.',
    descriptions: {
      aquaControl:
        'A desktop application for water consumption and billing records, including customer management, monthly usage entry, automatic bill calculation, payments, debts, and reports.',
      smartSafe:
        'An IoT smart safe simulation with remote control, security code generation, and real-time device status monitoring.',
    },
    cartridge: {
      insert: 'Insert cartridge: {title}',
      level: 'LV {level}',
      more: '+{count}',
    },
    screen: {
      nowPlaying: 'NOW PLAYING:',
      readme: 'README',
      stackLabel: 'Technology stack',
      code: 'VIEW CODE',
      codeLabel: 'View code of {title} on GitHub',
      demo: 'PLAY DEMO',
      demoLabel: 'Play demo of {title}',
      eject: 'EJECT',
      ejectLabel: 'Eject: close {title}',
    },
  },
  skills: {
    heading: 'INVENTORY',
    bagsLabel: 'Skill bags',
    slotsLabel: '{bag}: items',
    slotsHint: 'Use the arrow keys to move between items.',
    itemInfo: 'ITEM INFO',
    type: 'TYPE',
    rarity: 'RARITY',
    usedIn: 'Used in:',
    usedInNone: 'No listed project yet',
    types: {
      language: 'Language',
      framework: 'Framework',
      database: 'Database',
      tool: 'Tool',
    },
    rarities: {
      common: 'Common',
      rare: 'Rare',
      epic: 'Epic',
      legendary: 'Legendary',
    },
    categories: {
      programming: {
        bag: 'CODE',
        title: 'Programming & Frontend',
        summary: 'Languages and frontend technologies for web, desktop, and mobile development.',
      },
      databases: {
        bag: 'DATA',
        title: 'Databases',
        summary: 'Database and backend data platforms used in projects.',
      },
      tools: {
        bag: 'TOOLS',
        title: 'Development Tools',
        summary: 'Tools for source control, containers, and daily development.',
      },
    },
    items: {
      cpp: 'A fast, low-level language. Great for algorithms, data structures and squeezing out performance.',
      csharp:
        'A modern, strongly typed language from Microsoft, used for desktop apps, APIs and backend logic.',
      html5: 'The structure of every web page: semantic, accessible markup.',
      css3: 'Layout, colors and motion for the web: Flexbox, Grid and animations.',
      javascript: 'The language of the browser. Adds interactivity and talks to APIs and devices.',
      typescript:
        'JavaScript with types. Catches bugs before runtime and keeps large codebases tidy.',
      angular:
        'A complete framework for web apps: components, signals, routing and dependency injection.',
      dart: "Google's client-optimized language and the engine behind Flutter.",
      flutter: 'One codebase for Android, iOS, web and desktop apps, with a fast hot reload.',
      mysql: 'A relational database: tables, relations and SQL queries.',
      firebase: "Google's backend platform: realtime database, authentication and hosting.",
      git: 'Version control: branches, commits and a safe history of every change.',
      docker: 'Packs an app and its dependencies into containers that run the same everywhere.',
      visualstudio: "Microsoft's full IDE for C# and C++, with a powerful debugger.",
      vscode: 'A light, extensible code editor, made for web development.',
      webstorm: "JetBrains' IDE for JavaScript and TypeScript, with smart refactoring.",
    },
  },
  contact: {
    eyebrow: 'Contact',
    heading: 'Get In Touch',
    subtitle: 'Have a project, role, or idea in mind? Send a note and I will get back to you soon.',
    linksLabel: 'Contact links',
    links: {
      email: 'Email',
      linkedin: 'LinkedIn',
      github: 'GitHub',
    },
    fields: {
      name: 'Name',
      email: 'Email',
      subject: 'Subject',
      message: 'Message',
    },
    errors: {
      nameRequired: 'Name is required.',
      emailRequired: 'Email is required.',
      emailInvalid: 'Enter a valid email address.',
      subjectRequired: 'Subject is required.',
      messageRequired: 'Message is required.',
    },
    submit: 'Open Email',
    sent: 'Email draft opened. Send it from your email app.',
    mailBody: {
      name: 'Name: {name}',
      email: 'Email: {email}',
    },
  },
  notFound: {
    heading: 'Page not found',
    message: 'The page you are looking for does not exist.',
    back: 'Back to home',
  },
} as const;
