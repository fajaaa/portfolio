import type { Dictionary } from './i18n.types';

export const bs: Dictionary = {
  meta: {
    title: {
      home: 'Kenan Fajic',
      notFound: 'Stranica nije pronađena',
      styleguide: 'Styleguide',
    },
  },
  nav: {
    ariaLabel: 'Glavna navigacija',
    toggleMenu: 'Otvori meni',
    links: {
      home: 'Početna',
      about: 'O meni',
      projects: 'Projekti',
      skills: 'Vještine',
      contact: 'Kontakt',
    },
    language: {
      label: 'Jezik',
      en: 'English',
      bs: 'Bosanski',
    },
  },
  backToTop: 'Nazad na početak',
  hud: {
    world: 'WORLD {world}',
    level: 'LV {level}/{total}',
    xpLabel: 'Napredak kroz stranicu',
    levelUp: 'LEVEL UP!',
    pause: {
      title: 'PAUZA',
      close: 'Zatvori meni',
      hint: '↑ ↓ odabir · Enter potvrdi · Esc zatvori',
    },
  },
  hero: {
    player: 'IGRAČ 1',
    subtitles: ['Full-stack developer', 'Angular entuzijasta', 'Rješavam probleme'],
    intro:
      'Student završne godine softverskog inženjerstva na FIT-u u Mostaru. Pravim korisne aplikacije i sa svakim projektom skupljam XP.',
    start: 'START',
    cv: 'Preuzmi CV',
    scroll: 'SKROLAJ',
    sceneLabel: 'Voxel ostrvo: mali Kenan kuca na računaru, uz drvo, vodopad, oblake i ptice',
    greetings: ['Zdravo! Dobrodošli u moj svijet.', 'Hej, igraču 1!', 'Nazad na kodiranje...'],
  },
  about: {
    sheetTitle: 'KARTICA LIKA',
    heading: 'Student softverskog inženjerstva koji uči praveći stvarne projekte.',
    bio: 'Student sam završne godine softverskog inženjerstva na FIT-u u Mostaru. Volim praviti korisne aplikacije, učiti nove tehnologije i usavršavati svoje vještine kroz praktične projekte.',
    portrait: {
      alt: 'Fotografija: Kenan Fajic',
      toggle: 'Prikaži pravu fotografiju',
    },
    header: {
      name: 'IME',
      class: 'KLASA',
      classValue: 'Softverski inženjer (student)',
      level: 'LV',
      levelValue: 'Završna godina',
    },
    attributes: {
      origin: 'PORIJEKLO',
      originValue: 'Lukavac, BiH',
      guild: 'CEH',
      guildValue: 'FIT Mostar – Softversko inženjerstvo',
      languages: 'JEZICI',
      languagesValue: 'Engleski, bosanski',
    },
    stats: {
      title: 'STATISTIKA',
      projects: 'Samostalni projekti',
      mentorship: 'Mjeseci mentorstva',
      areas: 'Tehničke oblasti',
    },
    cv: {
      loot: 'PLIJEN: CV.PDF',
      hint: 'Preuzmi CV',
    },
  },
  projects: {
    heading: 'ODABERI IGRU',
    count: {
      one: '{count} IGRA PRONAĐENA',
      few: '{count} IGRE PRONAĐENE',
      other: '{count} IGARA PRONAĐENO',
    },
    loading: 'UČITAVAM…',
    empty: 'Polica sa kasetama je prazna: nije pronađen nijedan javni GitHub repozitorij.',
    defaultDescription: 'Javni GitHub repozitorij sa profila fajaaa.',
    descriptions: {
      aquaControl:
        'Desktop aplikacija za evidenciju potrošnje vode i naplate, sa upravljanjem potrošačima, unosom mjesečne potrošnje, automatskim obračunom računa, uplatama, dugovanjima i izvještajima.',
      smartSafe:
        'IoT simulacija pametnog sefa sa daljinskim upravljanjem, generisanjem sigurnosnog koda i praćenjem stanja uređaja u stvarnom vremenu.',
    },
    cartridge: {
      insert: 'Ubaci kasetu: {title}',
      level: 'LV {level}',
      more: '+{count}',
    },
    screen: {
      nowPlaying: 'SADA IGRAŠ:',
      readme: 'README',
      stackLabel: 'Korištene tehnologije',
      code: 'POGLEDAJ KOD',
      codeLabel: 'Pogledaj kod projekta {title} na GitHubu',
      demo: 'IGRAJ DEMO',
      demoLabel: 'Igraj demo projekta {title}',
      eject: 'IZBACI',
      ejectLabel: 'Izbaci: zatvori {title}',
    },
  },
  skills: {
    eyebrow: 'Tehnologije',
    heading: 'Vještine',
    categoriesLabel: 'Kategorije vještina',
    categories: {
      programming: {
        title: 'Programiranje i frontend',
        summary: 'Jezici i frontend tehnologije za razvoj web, desktop i mobilnih aplikacija.',
      },
      databases: {
        title: 'Baze podataka',
        summary: 'Baze podataka i backend platforme za podatke koje koristim u projektima.',
      },
      tools: {
        title: 'Razvojni alati',
        summary: 'Alati za verzionisanje koda, kontejnere i svakodnevni rad.',
      },
    },
  },
  contact: {
    eyebrow: 'Kontakt',
    heading: 'Javi mi se',
    subtitle: 'Imaš projekat, posao ili ideju na umu? Pošalji mi poruku i javit ću ti se uskoro.',
    linksLabel: 'Kontakt linkovi',
    links: {
      email: 'E-mail',
      linkedin: 'LinkedIn',
      github: 'GitHub',
    },
    fields: {
      name: 'Ime',
      email: 'E-mail',
      subject: 'Naslov',
      message: 'Poruka',
    },
    errors: {
      nameRequired: 'Ime je obavezno.',
      emailRequired: 'E-mail je obavezan.',
      emailInvalid: 'Unesi ispravnu e-mail adresu.',
      subjectRequired: 'Naslov je obavezan.',
      messageRequired: 'Poruka je obavezna.',
    },
    submit: 'Otvori e-mail',
    sent: 'Nacrt e-maila je otvoren. Pošalji ga iz svoje aplikacije za e-mail.',
    mailBody: {
      name: 'Ime: {name}',
      email: 'E-mail: {email}',
    },
  },
  notFound: {
    heading: 'Stranica nije pronađena',
    message: 'Stranica koju tražiš ne postoji.',
    back: 'Nazad na početnu',
  },
};
