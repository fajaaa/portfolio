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
    eyebrow: 'About Me',
    heading: 'Software Engineering student learning by building real projects.',
    bio: 'I am a final-year Software Engineering student at FIT Mostar. I enjoy building useful applications, learning new technologies, and improving my skills through practical projects.',
    portraitAlt: 'Kenan Fajic',
    factsLabel: 'Key facts',
    facts: {
      location: 'Location: Lukavac, Bosnia and Herzegovina',
      education: 'Education: FIT Mostar - Software Engineering',
      languages: 'Languages: English, Bosnian',
    },
    statsLabel: 'Portfolio statistics',
    stats: {
      projects: 'Self-Initiated Projects',
      mentorship: 'Mentorship Months',
      areas: 'Technical Areas',
    },
    cv: 'Download CV',
  },
  projects: {
    eyebrow: 'Selected Work',
    heading: 'My Projects',
    loading: 'Loading GitHub projects...',
    empty: 'No public GitHub repositories found.',
    defaultDescription: 'Public GitHub repository from the fajaaa profile.',
    descriptions: {
      aquaControl:
        'A desktop application for water consumption and billing records, including customer management, monthly usage entry, automatic bill calculation, payments, debts, and reports.',
      smartSafe:
        'An IoT smart safe simulation with remote control, security code generation, and real-time device status monitoring.',
    },
    card: {
      code: 'Code',
      codeLabel: '{title} GitHub repository',
      demo: 'Demo',
      demoLabel: '{title} live demo',
      stackLabel: 'Technology stack',
    },
  },
  skills: {
    eyebrow: 'Technical Stack',
    heading: 'Skills',
    categoriesLabel: 'Skill categories',
    categories: {
      programming: {
        title: 'Programming & Frontend',
        summary: 'Languages and frontend technologies for web, desktop, and mobile development.',
      },
      databases: {
        title: 'Databases',
        summary: 'Database and backend data platforms used in projects.',
      },
      tools: {
        title: 'Development Tools',
        summary: 'Tools for source control, containers, and daily development.',
      },
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
