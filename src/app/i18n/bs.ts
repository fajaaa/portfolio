import type { Dictionary } from './i18n.types';

export const bs: Dictionary = {
  meta: {
    title: {
      home: 'Kenan Fajic',
      notFound: 'Stranica nije pronađena',
      styleguide: 'Styleguide',
    },
    description:
      'Kenan Fajic: student završne godine softverskog inženjerstva na FIT-u u Mostaru i full-stack developer. Prođi kroz njegove projekte, vještine i kontakte u retro pixel-art portfoliju u stilu igre.',
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
    sound: {
      label: 'Zvuk',
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
      insert: 'Ubaci kasetu:',
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
    heading: 'INVENTAR',
    bagsLabel: 'Torbe s vještinama',
    slotsLabel: '{bag}: predmeti',
    slotsHint: 'Strelicama se krećeš između predmeta.',
    itemInfo: 'INFO O PREDMETU',
    type: 'TIP',
    rarity: 'RIJETKOST',
    usedIn: 'Korišteno u:',
    usedInNone: 'Još nema projekta na listi',
    types: {
      language: 'Jezik',
      framework: 'Framework',
      database: 'Baza podataka',
      tool: 'Alat',
    },
    rarities: {
      common: 'Običan',
      rare: 'Rijedak',
      epic: 'Epski',
      legendary: 'Legendarni',
    },
    categories: {
      programming: {
        bag: 'KOD',
        title: 'Programiranje i frontend',
        summary: 'Jezici i frontend tehnologije za razvoj web, desktop i mobilnih aplikacija.',
      },
      databases: {
        bag: 'PODACI',
        title: 'Baze podataka',
        summary: 'Baze podataka i backend platforme za podatke koje koristim u projektima.',
      },
      tools: {
        bag: 'ALATI',
        title: 'Razvojni alati',
        summary: 'Alati za verzionisanje koda, kontejnere i svakodnevni rad.',
      },
    },
    items: {
      cpp: 'Brz jezik niskog nivoa. Odličan za algoritme, strukture podataka i izvlačenje maksimalnih performansi.',
      csharp:
        'Moderan, strogo tipiziran Microsoftov jezik za desktop aplikacije, API-je i backend logiku.',
      html5: 'Struktura svake web stranice: semantički i pristupačan markup.',
      css3: 'Raspored, boje i pokret na webu: Flexbox, Grid i animacije.',
      javascript: 'Jezik preglednika. Dodaje interaktivnost i komunicira s API-jima i uređajima.',
      typescript:
        'JavaScript s tipovima. Hvata greške prije pokretanja i drži velike projekte urednim.',
      angular:
        'Kompletan framework za web aplikacije: komponente, signali, rutiranje i dependency injection.',
      dart: 'Googleov jezik optimizovan za klijentske aplikacije, pokretač Fluttera.',
      flutter: 'Jedan kod za Android, iOS, web i desktop aplikacije, uz brzi hot reload.',
      mysql: 'Relaciona baza podataka: tabele, relacije i SQL upiti.',
      firebase: 'Googleova backend platforma: baza u realnom vremenu, autentifikacija i hosting.',
      git: 'Kontrola verzija: grane, commitovi i sigurna historija svake promjene.',
      docker: 'Pakuje aplikaciju i njene zavisnosti u kontejnere koji svugdje rade isto.',
      visualstudio: 'Microsoftov kompletan IDE za C# i C++, s moćnim debuggerom.',
      vscode: 'Lagan i proširiv editor koda, napravljen za web razvoj.',
      webstorm: 'JetBrainsov IDE za JavaScript i TypeScript, s pametnim refaktorisanjem.',
    },
  },
  contact: {
    heading: 'Javi mi se',
    npc: {
      greeting:
        'Hej, putniče! Imaš projekat, posao ili ideju na umu? Pošalji mi poruku i javit ću ti se uskoro.',
      name: 'Prvo najvažnije: kako da te zovem?',
      email: 'Drago mi je, {name}! Gdje da ti pošaljem odgovor? Upiši svoj e-mail.',
      subject: 'Važi. O čemu je riječ u ovoj misiji? Daj joj kratak naslov.',
      message: 'Sad ono glavno: ispričaj mi sve!',
      summary:
        'Evo šta sam zapisao. Ispravi šta treba preko „izmijeni“ ili pritisni POŠALJI kad sve bude u redu.',
      sent: 'Hvala, {name}! Trebala bi ti se otvoriti aplikacija za e-mail sa svime popunjenim, samo tamo pritisni pošalji. Ništa se nije otvorilo? Može i preko e-maila u FAST TRAVEL meniju.',
    },
    errors: {
      nameRequired: 'Hmm, nisam uhvatio tvoje ime. Možeš li ga upisati?',
      emailRequired: 'Bez e-maila ti ne mogu odgovoriti. Možeš li ga upisati?',
      emailInvalid: 'Hmm, ovaj e-mail mi izgleda ukleto. Pokušaj ponovo?',
      subjectRequired: 'Svaka misija treba naslov. Kako ćemo nazvati ovu?',
      messageRequired: 'Svitak je prazan! Napiši mi bar par riječi?',
    },
    fields: {
      name: 'Ime',
      email: 'E-mail',
      subject: 'Naslov',
      message: 'Poruka',
    },
    hints: {
      message: 'Enter: dalje · Shift+Enter: novi red',
    },
    step: 'KORAK {current}/{total}',
    stepDone: 'SVE SPREMNO',
    controls: {
      back: 'Nazad',
      next: 'Dalje',
      send: 'Pošalji',
      restart: 'Nova poruka',
      edit: 'izmijeni',
    },
    quest: {
      title: 'QUEST COMPLETE',
      detail: '+100 XP',
    },
    fastTravel: {
      title: 'FAST TRAVEL',
      hint: 'Preskoči razgovor i idi pravo na cilj.',
    },
    links: {
      email: 'E-mail',
      linkedin: 'LinkedIn',
      github: 'GitHub',
      cv: 'Preuzmi CV',
    },
    mailBody: {
      name: 'Ime: {name}',
      email: 'E-mail: {email}',
    },
  },
  intro: {
    title: 'Kenan Fajic: početni ekran',
    loading: 'UČITAVANJE',
    loadingLabel: 'Učitavanje',
    pressStart: 'PRESS START',
    language: 'JEZIK',
    sound: 'ZVUK',
    soundOff: 'NE',
    soundOn: 'DA',
    hint: '↑ ↓ biraj · ← → promijeni · Enter kreni',
    skip: 'PRESKOČI',
  },
  konami: {
    title: 'ŠIFRA AKTIVIRANA',
    detail: '+40 NOVČIĆA',
  },
  notFound: {
    title: 'GAME OVER: stranica nije pronađena',
    heading: 'GAME OVER',
    message:
      'Stranica koju tražiš ne postoji. Možda je link pokvaren ili je nivo premješten.',
    continue: 'CONTINUE?',
    yes: 'DA',
    no: 'NE',
    thanks: 'HVALA NA IGRANJU',
    insertCoin: 'INSERT COIN',
    back: 'Nazad na početnu',
    hint: '← → biraj · Enter potvrdi',
  },
};
