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
    toggleMenu: 'Otvori ili zatvori navigaciju',
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
  backToTop: 'Nazad na vrh',
  hero: {
    greeting: 'Zdravo, ja sam',
    subtitles: ['Full-stack developer', 'Angular entuzijasta', 'Rješavam probleme'],
    cta: 'Pogledaj moje radove',
    photoAlt: 'Kenan Fajic',
  },
  about: {
    eyebrow: 'O meni',
    heading: 'Student softverskog inženjerstva koji uči praveći stvarne projekte.',
    bio: 'Student sam završne godine softverskog inženjerstva na FIT-u u Mostaru. Volim praviti korisne aplikacije, učiti nove tehnologije i usavršavati svoje vještine kroz praktične projekte.',
    portraitAlt: 'Kenan Fajic',
    factsLabel: 'Osnovne informacije',
    facts: {
      location: 'Lokacija: Lukavac, Bosna i Hercegovina',
      education: 'Obrazovanje: FIT Mostar - Softversko inženjerstvo',
      languages: 'Jezici: engleski, bosanski',
    },
    statsLabel: 'Statistika portfolija',
    stats: {
      projects: 'Samostalni projekti',
      mentorship: 'Mjeseci mentorstva',
      areas: 'Tehničke oblasti',
    },
    cv: 'Preuzmi CV',
  },
  projects: {
    eyebrow: 'Izdvojeni radovi',
    heading: 'Moji projekti',
    loading: 'Učitavam projekte sa GitHuba...',
    empty: 'Nije pronađen nijedan javni GitHub repozitorij.',
    defaultDescription: 'Javni GitHub repozitorij sa profila fajaaa.',
    descriptions: {
      aquaControl:
        'Desktop aplikacija za evidenciju potrošnje vode i naplate, sa upravljanjem potrošačima, unosom mjesečne potrošnje, automatskim obračunom računa, uplatama, dugovanjima i izvještajima.',
      smartSafe:
        'IoT simulacija pametnog sefa sa daljinskim upravljanjem, generisanjem sigurnosnog koda i praćenjem stanja uređaja u stvarnom vremenu.',
    },
    card: {
      code: 'Kod',
      codeLabel: 'GitHub repozitorij projekta {title}',
      demo: 'Demo',
      demoLabel: 'Demo uživo projekta {title}',
      stackLabel: 'Korištene tehnologije',
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
