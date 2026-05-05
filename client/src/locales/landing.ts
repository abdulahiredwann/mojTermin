export type Locale = "en" | "sl";

export type MockSlot = { provider: string; wait: string; next: string };

export type LandingStrings = {
  langEnglish: string;
  langSlovenian: string;
  heroTitle: string;
  heroSubtitle: string;
  labelProblem: string;
  placeholderProblem: string;
  attachImageAria: string;
  analyzeButton: string;
  analyzing: string;
  heroValidationNeedInput: string;
  resultsTitle: string;
  resultsMockNote: string;
  resultWaitLabel: string;
  resultNextLabel: string;
  mockSlots: MockSlot[];
  footerAbout: string;
  footerTerms: string;
  footerPrivacy: string;
  footerContact: string;
  footerCopyright: string;
  howTitle: string;
  step1Title: string;
  step1Body: string;
  step2Title: string;
  step2Body: string;
  step3Title: string;
  step3Body: string;
  benefitsTitle: string;
  benefit1Title: string;
  benefit1Body: string;
  benefit2Title: string;
  benefit2Body: string;
  benefit3Title: string;
  benefit3Body: string;
  /** Floating AI chat (frontend demo) */
  chatFabOpenAria: string;
  chatFabCloseAria: string;
  chatTitle: string;
  chatBadge: string;
  chatWelcome: string;
  chatPlaceholder: string;
  chatSendAria: string;
  chatDemoReply: string;
};

export const landingCopy: Record<Locale, LandingStrings> = {
  en: {
    langEnglish: "English",
    langSlovenian: "Slovenian",
    heroTitle: "The fastest path to your healthcare appointment.",
    heroSubtitle: "Tell us what you need. Add a photo of your referral if you have one — two quick steps.",
    labelProblem: "What do you need?",
    placeholderProblem: "e.g. knee MRI, dermatology…",
    attachImageAria: "Attach a photo (referral)",
    analyzeButton: "Check availability",
    analyzing: "Checking…",
    heroValidationNeedInput: "Add a short description or attach a photo.",
    resultsTitle: "Example matches (preview)",
    resultsMockNote:
      "Demo data for testing. Later this will use your text, image analysis, and live providers.",
    resultWaitLabel: "Est. wait",
    resultNextLabel: "Earliest option",
    mockSlots: [
      {
        provider: "University Medical Centre Ljubljana",
        wait: "~6 weeks",
        next: "12 May 2026",
      },
      {
        provider: "General Hospital Celje — Radiology",
        wait: "~4 weeks",
        next: "28 Apr 2026",
      },
      {
        provider: "Private clinic — Terme",
        wait: "~2 weeks",
        next: "18 Apr 2026",
      },
    ],
    footerAbout: "About",
    footerTerms: "Terms of use",
    footerPrivacy: "Privacy",
    footerContact: "Contact",
    footerCopyright: "© 2024 MojTermin. All rights reserved.",
    howTitle: "How it works?",
    step1Title: "1. Upload your referral",
    step1Body: "Easily submit your e-referral.",
    step2Title: "2. AI optimization",
    step2Body: "Artificial intelligence optimizes your referral and finds the most suitable appointment for you.",
    step3Title: "3. Choose appointment",
    step3Body: "Select and confirm your appointment.",
    benefitsTitle: "Why use MojTermin",
    benefit1Title: "Save time:",
    benefit1Body: "Spend less time waiting on hold and calling around.",
    benefit2Title: "Trustworthy:",
    benefit2Body: "Your data is handled with care and discretion.",
    benefit3Title: "Simple process:",
    benefit3Body: "A clear interface that works for every generation.",
    chatFabOpenAria: "Open AI assistant (demo)",
    chatFabCloseAria: "Close assistant",
    chatTitle: "Assistant",
    chatBadge: "Demo",
    chatWelcome:
      "Hi — this is a preview of the assistant that will help you explain what you need and find shorter waits. Ask anything to try the idea.",
    chatPlaceholder: "Ask a question…",
    chatSendAria: "Send message",
    chatDemoReply:
      "Thanks — this is a UI-only demo. Soon this will connect to our real assistant, your request, and live provider data.",
  },
  sl: {
    langEnglish: "Angleščina",
    langSlovenian: "Slovenščina",
    heroTitle: "Najhitrejša pot do vašega zdravstvenega termina.",
    heroSubtitle: "Napišite, kaj potrebujete. Če imate, dodajte fotografijo napotnice — dva hitra koraka.",
    labelProblem: "Kaj potrebujete?",
    placeholderProblem: "npr. MRI kolena, dermatolog…",
    attachImageAria: "Priloži fotografijo (napotnica)",
    analyzeButton: "Preveri razpoložljivost",
    analyzing: "Preverjam…",
    heroValidationNeedInput: "Vpišite kratek opis ali priložite fotografijo.",
    resultsTitle: "Primer ujemanj (predogled)",
    resultsMockNote:
      "Demo podatki za testiranje. Kasneje bomo uporabili vaš besedilo, analizo slike in dejanske ponudnike.",
    resultWaitLabel: "Predviden čakalni čas",
    resultNextLabel: "Najzgodnejša možnost",
    mockSlots: [
      {
        provider: "UKC Ljubljana",
        wait: "~6 tednov",
        next: "12. maj 2026",
      },
      {
        provider: "SB Celje — radiologija",
        wait: "~4 tedni",
        next: "28. apr 2026",
      },
      {
        provider: "Zasebna ambulanta — Terme",
        wait: "~2 tedna",
        next: "18. apr 2026",
      },
    ],
    footerAbout: "O nas",
    footerTerms: "Pogoji uporabe",
    footerPrivacy: "Zasebnost",
    footerContact: "Kontakt",
    footerCopyright: "© 2024 MojTermin. Vse pravice pridržane.",
    howTitle: "Kako deluje?",
    step1Title: "1. Naložite napotnico",
    step1Body: "Enostavno oddajte e-napotnico.",
    step2Title: "2. UI optimizacija",
    step2Body: "Umetna inteligenca optimizira vašo napotnico in poišče najbolj ustrezen termin za vas.",
    step3Title: "3. Izberite termin",
    step3Body: "Izberite in potrdite vaš termin.",
    benefitsTitle: "Prednosti storitve",
    benefit1Title: "Prihranek časa:",
    benefit1Body: "Izognite se dolgemu čakanju in telefonskim klicem.",
    benefit2Title: "Zaupanja vredno:",
    benefit2Body: "Vaši podatki so varni in obravnavani z najvišjo diskretnostjo.",
    benefit3Title: "Enostaven postopek:",
    benefit3Body: "Uporabniku prijazen vmesnik za vse generacije.",
    chatFabOpenAria: "Odpri pomočnika AI (demo)",
    chatFabCloseAria: "Zapri pomočnika",
    chatTitle: "Pomočnik",
    chatBadge: "Demo",
    chatWelcome:
      "Živijo — to je predogled pomočnika, ki vam bo pomagal razložiti potrebo in najti krajše čakalne čase. Vprašajte kar koli.",
    chatPlaceholder: "Vnesite vprašanje…",
    chatSendAria: "Pošlji sporočilo",
    chatDemoReply:
      "Hvala — to je demo samo v vmesniku. Kmalu bo povezano z našim pomočnikom, vašo zahtevo in podatki ponudnikov.",
  },
};
