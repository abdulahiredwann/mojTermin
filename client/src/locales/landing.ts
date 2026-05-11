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
  navHome: string;
  navPrivacy: string;
  navAbout: string;
  navContact: string;
  /** Floating AI chat (frontend demo) */
  chatFabOpenAria: string;
  chatFabCloseAria: string;
  chatTitle: string;
  chatBadge: string;
  chatWelcome: string;
  chatPlaceholder: string;
  chatSendAria: string;
  chatDemoReply: string;
  authLogin: string;
  authSignup: string;
  authLoginTitle: string;
  authSignupTitle: string;
  authEmail: string;
  authPassword: string;
  authConfirmPassword: string;
  authName: string;
  authPhone: string;
  authLoginButton: string;
  authSignupButton: string;
  authOrContinueWith: string;
  authContinueWithGoogle: string;
  authNoAccount: string;
  authHaveAccount: string;
  authForgotPassword: string;
  authLogout: string;
  authDashboard: string;
  authSettings: string;
  authPasswordMismatch: string;
  userMenuAria: string;
  userSettingsIntro: string;
  heroValidationPickCity: string;
  dashboardPageTitle: string;
  dashboardIntro: string;
  dashboardYourCity: string;
  dashboardCardTotal: string;
  dashboardCardPending: string;
  dashboardNewRequestTitle: string;
  dashboardHistoryTitle: string;
  dashboardEmptyHistory: string;
  dashboardTableSubmitted: string;
  dashboardTableStatus: string;
  dashboardTableHospital: string;
  dashboardTableNeed: string;
  dashboardTableWhen: string;
  dashboardAccountEmail: string;
  dashboardReferralPhoto: string;
  dashboardReferralPhotoHint: string;
  dashboardSelectHospital: string;
  dashboardPreferredAppointmentDate: string;
  dashboardEmailNote: string;
};

export const landingCopy: Record<Locale, LandingStrings> = {
  en: {
    langEnglish: "English",
    langSlovenian: "Slovenian",
    heroTitle: "The fastest path to your healthcare appointment.",
    heroSubtitle:
      "Tell us what you need and your city — we’ll match you with available hospitals.",
    labelProblem: "What do you need?",
    placeholderProblem: "e.g. knee MRI, dermatology…",
    attachImageAria: "Attach a photo (referral)",
    analyzeButton: "Check availability",
    analyzing: "Checking…",
    heroValidationNeedInput: "Describe what you need.",
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
    step2Body:
      "Artificial intelligence optimizes your referral and finds the most suitable appointment for you.",
    step3Title: "3. Choose appointment",
    step3Body: "Select and confirm your appointment.",
    benefitsTitle: "Why choose MojTermin?",
    benefit1Title: "Time",
    benefit1Body: "Reach an appointment faster without long waiting lines.",
    benefit2Title: "Smart analysis",
    benefit2Body: "Precise matching of your referral with available slots.",
    benefit3Title: "Stress-free",
    benefit3Body: "The process is simple and clear for the user.",
    navHome: "Home",
    navPrivacy: "Privacy",
    navAbout: "About us",
    navContact: "Contact",
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
    authLogin: "Log in",
    authSignup: "Sign up",
    authLoginTitle: "Welcome back",
    authSignupTitle: "Create your account",
    authEmail: "Email",
    authPassword: "Password",
    authConfirmPassword: "Confirm password",
    authName: "Full name",
    authPhone: "Phone number",
    authLoginButton: "Log in",
    authSignupButton: "Create account",
    authOrContinueWith: "or continue with",
    authContinueWithGoogle: "Continue with Google",
    authNoAccount: "Don't have an account?",
    authHaveAccount: "Already have an account?",
    authForgotPassword: "Forgot password?",
    authLogout: "Log out",
    authDashboard: "Dashboard",
    authSettings: "Settings",
    userMenuAria: "Account menu",
    userSettingsIntro:
      "Manage your account preferences here. More options will be available soon.",
    authPasswordMismatch: "Passwords do not match.",
    heroValidationPickCity: "Please choose your city.",
    dashboardPageTitle: "Your dashboard",
    dashboardIntro: "Check availability, add an optional referral photo, and track your requests.",
    dashboardYourCity: "Your city",
    dashboardCardTotal: "Total requests",
    dashboardCardPending: "Pending",
    dashboardNewRequestTitle: "Check availability",
    dashboardHistoryTitle: "Your appointment requests",
    dashboardEmptyHistory: "You don’t have any requests yet. Submit one using the form above.",
    dashboardTableSubmitted: "Submitted",
    dashboardTableStatus: "Status",
    dashboardTableHospital: "Hospital",
    dashboardTableNeed: "What you asked for",
    dashboardTableWhen: "Preferred date",
    dashboardAccountEmail: "Contact email",
    dashboardReferralPhoto: "Referral image (optional)",
    dashboardReferralPhotoHint:
      "Upload coming soon — selecting a file is only stored in your browser for now.",
    dashboardSelectHospital: "Select hospital",
    dashboardPreferredAppointmentDate: "Preferred appointment date",
    dashboardEmailNote: "We use your account email for this request.",
  },
  sl: {
    langEnglish: "Angleščina",
    langSlovenian: "Slovenščina",
    heroTitle: "Najhitrejša pot do vašega zdravstvenega termina.",
    heroSubtitle:
      "Napišite, kaj potrebujete, in izberite mesto — ujemali vas bomo z razpoložljivimi zdravstvenimi zavodi.",
    labelProblem: "Kaj potrebujete?",
    placeholderProblem: "npr. MRI kolena, dermatolog…",
    attachImageAria: "Priloži fotografijo (napotnica)",
    analyzeButton: "Preveri razpoložljivost",
    analyzing: "Preverjam…",
    heroValidationNeedInput: "Opišite, kaj potrebujete.",
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
    step2Body:
      "Umetna inteligenca optimizira vašo napotnico in poišče najbolj ustrezen termin za vas.",
    step3Title: "3. Izberite termin",
    step3Body: "Izberite in potrdite vaš termin.",
    benefitsTitle: "Zakaj izbrati MojTermin?",
    benefit1Title: "Čas",
    benefit1Body: "Hitro do termina brez dolgih čakalnih vrst.",
    benefit2Title: "Pametna analiza",
    benefit2Body: "Natančna uskladitev napotnice s prostimi mesti.",
    benefit3Title: "Brez stresa",
    benefit3Body: "Postopek je enostaven in pregleden za uporabnika.",
    navHome: "Domov",
    navPrivacy: "Zasebnost",
    navAbout: "O nas",
    navContact: "Kontakt",
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
    authLogin: "Prijava",
    authSignup: "Registracija",
    authLoginTitle: "Dobrodošli nazaj",
    authSignupTitle: "Ustvarite račun",
    authEmail: "E-pošta",
    authPassword: "Geslo",
    authConfirmPassword: "Potrdi geslo",
    authName: "Polno ime",
    authPhone: "Telefonska številka",
    authLoginButton: "Prijava",
    authSignupButton: "Ustvari račun",
    authOrContinueWith: "ali nadaljuj z",
    authContinueWithGoogle: "Nadaljuj z Google",
    authNoAccount: "Nimate računa?",
    authHaveAccount: "Že imate račun?",
    authForgotPassword: "Pozabljeno geslo?",
    authLogout: "Odjava",
    authDashboard: "Nadzorna plošča",
    authSettings: "Nastavitve",
    userMenuAria: "Meni računa",
    userSettingsIntro:
      "Tukaj boste kmalu upravljali nastavitve računa. Funkcija je v pripravi.",
    authPasswordMismatch: "Gesli se ne ujemata.",
    heroValidationPickCity: "Izberite mesto.",
    dashboardPageTitle: "Vaša nadzorna plošča",
    dashboardIntro:
      "Preverite razpoložljivost, dodajte neobvezno fotografijo napotnice in spremljajte svoje zahteve.",
    dashboardYourCity: "Vaše mesto",
    dashboardCardTotal: "Skupaj zahtev",
    dashboardCardPending: "V čakanju",
    dashboardNewRequestTitle: "Preveri razpoložljivost",
    dashboardHistoryTitle: "Vaše zahteve za termin",
    dashboardEmptyHistory:
      "Še nimate zahtev. Oddajte jo z obrazcom zgoraj.",
    dashboardTableSubmitted: "Oddano",
    dashboardTableStatus: "Stanje",
    dashboardTableHospital: "Zdravstveni zavod",
    dashboardTableNeed: "Kaj ste iskali",
    dashboardTableWhen: "Želen datum",
    dashboardAccountEmail: "Kontakt e-pošta",
    dashboardReferralPhoto: "Slika napotnice (neobvezno)",
    dashboardReferralPhotoHint:
      "Nalaganje pride kmalu — izbira datoteka je za zdaj le v brskalniku.",
    dashboardSelectHospital: "Izberi zdravstveni zavod",
    dashboardPreferredAppointmentDate: "Želeni datum termina",
    dashboardEmailNote: "Za to zahtevo uporabimo e-pošto vašega računa.",
  },
};
