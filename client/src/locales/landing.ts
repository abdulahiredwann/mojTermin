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
  analyzeStatusReadingImages: string;
  analyzeStatusFindingHospitals: string;
  analyzeStatusExploring: string;
  analyzeStatusAlmostThere: string;
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
  navPricing: string;
  navPrivacy: string;
  navAbout: string;
  navContact: string;
  pricingTitle: string;
  pricingSubtitle: string;
  pricingRecommended: string;
  pricingFreeName: string;
  pricingFreeTagline: string;
  pricingFreePrice: string;
  pricingFreeFeatures: string[];
  pricingFreeExcluded: string[];
  pricingFreeCta: string;
  pricingProName: string;
  pricingProTagline: string;
  pricingProPrice: string;
  pricingProPriceNote: string;
  pricingProFeatures: string[];
  pricingProCta: string;
  pricingCompareTitle: string;
  pricingCompareFeature: string;
  pricingCompareRows: Array<{
    feature: string;
    free: boolean | "text";
    pro: boolean | "text";
    freeText?: string;
    proText?: string;
  }>;
  signupPlanPanelEyebrow: string;
  signupPlanPanelTitle: string;
  signupPlanPanelSubtitle: string;
  signupPlanChooseLabel: string;
  signupPlanFreeOption: string;
  signupPlanProOption: string;
  signupPlanFreePaymentNote: string;
  signupPlanProPaymentNote: string;
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
  comingSoon: string;
  settingsComingSoonIntro: string;
  authPasswordMismatch: string;
  userMenuAria: string;
  userSettingsIntro: string;
  heroValidationPickCity: string;
  dashboardPageTitle: string;
  dashboardIntro: string;
  dashboardYourCity: string;
  dashboardCardTotal: string;
  dashboardCardPending: string;
  dashboardCardHistory: string;
  dashboardCardPlan: string;
  dashboardCardPlanSince: string;
  dashboardCardPlanUpgrade: string;
  dashboardNewRequestTitle: string;
  dashboardHistoryTitle: string;
  dashboardEmptyHistory: string;
  dashboardTableSubmitted: string;
  dashboardTableStatus: string;
  dashboardTableHospital: string;
  dashboardTableNeed: string;
  dashboardTableWhen: string;
  dashboardTableActions: string;
  dashboardEditPreferredDate: string;
  dashboardSave: string;
  dashboardCancel: string;
  dashboardDelete: string;
  dashboardDeleteRequestTitle: string;
  dashboardDeleteRequestBody: string;
  dashboardRemoveReferralImageTitle: string;
  dashboardRemoveReferralImageBody: string;
  dashboardConfirmRemoveReferralImage: string;
  dashboardConfirmDelete: string;
  dashboardAccountEmail: string;
  dashboardReferralPhoto: string;
  dashboardReferralPhotoHint: string;
  dashboardReferralAttachedLabel: string;
  dashboardReferralRemoveFromListAria: string;
  dashboardReferralRemoveImageAria: string;
  dashboardReferralAiPanelTitle: string;
  dashboardReferralAiPanelHint: string;
  dashboardReferralAiError: string;
  dashboardReferralAiDetail: string;
  dashboardReferralRawMentions: string;
  dashboardReferralSearchLimitNote: string;
  dashboardSelectHospital: string;
  dashboardPreferredAppointmentDate: string;
  dashboardEmailNote: string;
  dashboardNotifyCheckbox: string;
  dashboardNotifyHint: string;
  trackingButtonLabel: string;
  trackingButtonSubmitting: string;
  trackingEmailCheckbox: string;
  trackingEmailHint: string;
  trackingFasterRefreshCheckbox: string;
  trackingFasterRefreshHint: string;
  trackingSmsCheckbox: string;
  trackingSmsHint: string;
  trackingUpgradeToPro: string;
  trackingGuestNote: string;
  confirmRequestModalTitle: string;
  confirmRequestModalDescription: string;
  confirmRequestModalHospital: string;
  confirmRequestModalEmail: string;
  confirmRequestModalPreferredDate: string;
  confirmRequestModalNotifyOn: string;
  confirmRequestModalNotifyOff: string;
  confirmRequestModalOk: string;
  userAreaTagline: string;
  userNavMyAppointments: string;
  userLayoutBackHome: string;
  userSidebarPlanFree: string;
  userSidebarPlanPro: string;
  userSidebarUpgradeTitle: string;
  userSidebarUpgradeBody: string;
  userSidebarUpgradeBullets: string[];
  userSidebarUpgradeCta: string;
  settingsIntro: string;
  settingsTabProfile: string;
  settingsTabPayments: string;
  settingsProfileSection: string;
  settingsEmailReadOnlyHint: string;
  settingsSaveProfile: string;
  settingsProfileSaved: string;
  settingsPasswordSection: string;
  settingsCurrentPassword: string;
  settingsNewPassword: string;
  settingsSavePassword: string;
  settingsPasswordSaved: string;
  settingsSubscriptionSection: string;
  settingsUpgradePlan: string;
  settingsCancelPlan: string;
  settingsCancelPlanTitle: string;
  settingsCancelPlanBody: string;
  settingsCancelPlanConfirm: string;
  settingsSubscriptionCancelled: string;
  settingsPaymentsSection: string;
  settingsPaymentsComingSoon: string;
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
    analyzeStatusReadingImages: "Reading your referral images…",
    analyzeStatusFindingHospitals: "Finding matching hospitals…",
    analyzeStatusExploring: "Exploring services and waits…",
    analyzeStatusAlmostThere: "Almost there…",
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
    navPricing: "Pricing",
    navPrivacy: "Privacy",
    navAbout: "About us",
    navContact: "Contact",
    pricingTitle: "Plans",
    pricingSubtitle: "Choose the option that works best for you.",
    pricingRecommended: "Recommended",
    pricingFreeName: "MojTermin FREE",
    pricingFreeTagline: "To get started — free",
    pricingFreePrice: "€0",
    pricingFreeFeatures: [
      "1 active tracking request",
      "Basic appointment monitoring",
      "Email notifications",
      "Basic dashboard overview",
      "Slower refresh rate",
      "No SMS notifications",
      "No priority processing",
    ],
    pricingFreeExcluded: ["No SMS notifications", "No priority processing"],
    pricingFreeCta: "Start for free",
    pricingProName: "MojTermin PRO",
    pricingProTagline: "For faster results",
    pricingProPrice: "€7",
    pricingProPriceNote: "/ month · no commitment",
    pricingProFeatures: [
      "Unlimited tracking",
      "Faster refresh (multiple times per day)",
      "Instant alerts",
      "Email + SMS notifications",
      "Priority slot detection",
      "Smarter suggestions (best slots)",
      "Search history",
    ],
    pricingProCta: "Upgrade to Pro",
    pricingCompareTitle: "Compare plans",
    pricingCompareFeature: "Feature",
    pricingCompareRows: [
      { feature: "Appointment tracking", free: true, pro: true },
      { feature: "Email notifications", free: true, pro: true },
      { feature: "SMS notifications", free: false, pro: true },
      { feature: "Fast refresh", free: false, pro: true },
      { feature: "Multiple requests", free: false, pro: true },
      { feature: "Priority processing", free: false, pro: true },
      {
        feature: "Price",
        free: "text",
        pro: "text",
        freeText: "€0",
        proText: "€7 / month",
      },
    ],
    signupPlanPanelEyebrow: "Your plan",
    signupPlanPanelTitle: "Plan configuration",
    signupPlanPanelSubtitle: "Choose FREE to start or PRO for faster tracking and SMS alerts.",
    signupPlanChooseLabel: "Subscription plan",
    signupPlanFreeOption: "MojTermin FREE — €0",
    signupPlanProOption: "MojTermin PRO — €7 / month",
    signupPlanFreePaymentNote: "No payment required. You can upgrade to PRO anytime from your account.",
    signupPlanProPaymentNote:
      "Billing is not active yet. Your account will be created on PRO; payment will be added in a later step.",
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
    comingSoon: "Coming soon",
    settingsComingSoonIntro:
      "Account settings aren’t editable yet — this section is coming soon. Your basic profile below is read-only.",
    userMenuAria: "Account menu",
    userSettingsIntro:
      "Manage your account preferences here. More options will be available soon.",
    authPasswordMismatch: "Passwords do not match.",
    heroValidationPickCity: "Please choose your city.",
    dashboardPageTitle: "Your dashboard",
    dashboardIntro:
      "Check availability, add an optional referral photo, and track your requests.",
    dashboardYourCity: "Your city",
    dashboardCardTotal: "Total requests",
    dashboardCardPending: "Pending",
    dashboardCardHistory: "History",
    dashboardCardPlan: "Your plan",
    dashboardCardPlanSince: "Since",
    dashboardCardPlanUpgrade: "Upgrade to PRO",
    dashboardNewRequestTitle: "Check availability",
    dashboardHistoryTitle: "Your appointment requests",
    dashboardEmptyHistory:
      "You don’t have any requests yet. Submit one using the form above.",
    dashboardTableSubmitted: "Submitted",
    dashboardTableStatus: "Status",
    dashboardTableHospital: "Hospital",
    dashboardTableNeed: "What you asked for",
    dashboardTableWhen: "Preferred date",
    dashboardTableActions: "Actions",
    dashboardEditPreferredDate: "Edit date",
    dashboardSave: "Save",
    dashboardCancel: "Cancel",
    dashboardDelete: "Delete",
    dashboardDeleteRequestTitle: "Delete this request?",
    dashboardDeleteRequestBody:
      "It will be removed from your list. You can submit a new request from the dashboard anytime.",
    dashboardRemoveReferralImageTitle: "Remove this image?",
    dashboardRemoveReferralImageBody:
      "Only this file will be deleted. Your appointment request stays on the list.",
    dashboardConfirmRemoveReferralImage: "Remove image",
    dashboardConfirmDelete: "Delete request",
    dashboardAccountEmail: "Contact email",
    dashboardReferralPhoto: "Referral image (optional)",
    dashboardReferralPhotoHint:
      "JPEG, PNG, GIF, or WebP — up to 15 images, 10 MB each. On “Check availability” we run AI vision on them and show findings beside hospitals. Use Ctrl/Cmd to pick several.",
    dashboardReferralAttachedLabel: "Referral photos",
    dashboardReferralRemoveFromListAria: "Remove file from upload list",
    dashboardReferralRemoveImageAria: "Remove this image from the appointment",
    dashboardReferralAiPanelTitle: "From your referral images (AI)",
    dashboardReferralAiPanelHint:
      "Extracted for testing — confirm against your documents. Not a medical diagnosis.",
    dashboardReferralAiError:
      "Image analysis failed; results use your text only.",
    dashboardReferralAiDetail: "Referral AI details",
    dashboardReferralRawMentions: "Raw mentions",
    dashboardReferralSearchLimitNote:
      "Only the first 8 images are used for AI analysis when checking availability. All selected images (up to 15) are still sent when you confirm the request.",
    dashboardSelectHospital: "Select hospital",
    dashboardPreferredAppointmentDate: "Preferred appointment date",
    dashboardEmailNote: "We use your account email for this request.",
    dashboardNotifyCheckbox: "Notify me when a slot is available (SMS & email)",
    dashboardNotifyHint:
      "We’ll use your account email and phone on file. Automated alerts aren’t active yet — we’ll store your preference.",
    trackingButtonLabel: "Track Appointment",
    trackingButtonSubmitting: "Submitting…",
    trackingEmailCheckbox: "Email notifications",
    trackingEmailHint: "We’ll email you when availability improves.",
    trackingFasterRefreshCheckbox: "Faster refresh checks",
    trackingFasterRefreshHint: "Check for updates more often throughout the day.",
    trackingSmsCheckbox: "SMS notifications",
    trackingSmsHint: "We’ll send SMS to the phone number on your account.",
    trackingUpgradeToPro: "Upgrade to PRO",
    trackingGuestNote: "Email notifications included. Faster refresh and SMS available with PRO.",
    confirmRequestModalTitle: "Request submitted",
    confirmRequestModalDescription: "Here’s a summary of what we recorded.",
    confirmRequestModalHospital: "Hospital",
    confirmRequestModalEmail: "Email",
    confirmRequestModalPreferredDate: "Preferred date",
    confirmRequestModalNotifyOn:
      "We’ll notify you by SMS and email when a slot becomes available at this hospital.",
    confirmRequestModalNotifyOff: "No availability alerts for this request.",
    confirmRequestModalOk: "OK",
    userAreaTagline: "My care",
    userNavMyAppointments: "My appointments",
    userLayoutBackHome: "Back to site",
    userSidebarPlanFree: "MojTermin FREE",
    userSidebarPlanPro: "MojTermin PRO",
    userSidebarUpgradeTitle: "Get faster results",
    userSidebarUpgradeBody: "Upgrade to PRO for more tracking and instant SMS + email alerts.",
    userSidebarUpgradeBullets: [
      "Unlimited tracking",
      "Faster refresh checks",
      "SMS + email notifications",
    ],
    userSidebarUpgradeCta: "See PRO plans",
    settingsIntro: "Manage your profile, password, and subscription.",
    settingsTabProfile: "Profile",
    settingsTabPayments: "Payment history",
    settingsProfileSection: "Profile",
    settingsEmailReadOnlyHint: "Email cannot be changed here.",
    settingsSaveProfile: "Save profile",
    settingsProfileSaved: "Profile updated.",
    settingsPasswordSection: "Password",
    settingsCurrentPassword: "Current password",
    settingsNewPassword: "New password",
    settingsSavePassword: "Update password",
    settingsPasswordSaved: "Password updated.",
    settingsSubscriptionSection: "Subscription",
    settingsUpgradePlan: "Upgrade to PRO",
    settingsCancelPlan: "Cancel subscription",
    settingsCancelPlanTitle: "Cancel PRO subscription?",
    settingsCancelPlanBody:
      "You will move to the FREE plan. PRO benefits end immediately; billing integration is coming later.",
    settingsCancelPlanConfirm: "Yes, cancel PRO",
    settingsSubscriptionCancelled: "Your subscription was cancelled. You are on FREE.",
    settingsPaymentsSection: "Payment history",
    settingsPaymentsComingSoon:
      "Your past payments will appear here once billing is connected. Coming soon.",
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
    analyzeStatusReadingImages: "Berem napotnice z vaših slik…",
    analyzeStatusFindingHospitals: "Iščem zdravstvene zavode…",
    analyzeStatusExploring: "Pregledujem storitve in čakalne čase…",
    analyzeStatusAlmostThere: "Še malo…",
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
    navPricing: "Paketi",
    navPrivacy: "Zasebnost",
    navAbout: "O nas",
    navContact: "Kontakt",
    pricingTitle: "Paketi",
    pricingSubtitle: "Izberite način, ki vam najbolj ustreza.",
    pricingRecommended: "Priporočeno",
    pricingFreeName: "MojTermin FREE",
    pricingFreeTagline: "Za začetek – brezplačno",
    pricingFreePrice: "0 €",
    pricingFreeFeatures: [
      "1 aktivno spremljanje",
      "Osnovno spremljanje terminov",
      "Email obvestila",
      "Osnovni pregled (dashboard)",
      "Počasnejše osveževanje",
      "Brez SMS obvestil",
      "Brez prioritete",
    ],
    pricingFreeExcluded: ["Brez SMS obvestil", "Brez prioritete"],
    pricingFreeCta: "Začni brezplačno",
    pricingProName: "MojTermin PRO",
    pricingProTagline: "Za hitrejše rezultate",
    pricingProPrice: "7 €",
    pricingProPriceNote: "/ mesec · brez vezave",
    pricingProFeatures: [
      "Neomejeno spremljanje",
      "Hitrejše osveževanje (večkrat dnevno)",
      "Takojšnja obvestila",
      "Email + SMS obvestila",
      "Prednost pri zaznavanju terminov",
      "Pametnejši predlogi (najboljši termini)",
      "Zgodovina iskanj",
    ],
    pricingProCta: "Nadgradi na Pro",
    pricingCompareTitle: "Primerjava paketov",
    pricingCompareFeature: "Funkcija",
    pricingCompareRows: [
      { feature: "Spremljanje terminov", free: true, pro: true },
      { feature: "Email obvestila", free: true, pro: true },
      { feature: "SMS obvestila", free: false, pro: true },
      { feature: "Hitro osveževanje", free: false, pro: true },
      { feature: "Več zahtevkov", free: false, pro: true },
      { feature: "Prioriteta", free: false, pro: true },
      {
        feature: "Plačilo",
        free: "text",
        pro: "text",
        freeText: "0 €",
        proText: "7 € / mesečno",
      },
    ],
    signupPlanPanelEyebrow: "Vaš paket",
    signupPlanPanelTitle: "Nastavitev paketa",
    signupPlanPanelSubtitle:
      "Izberite FREE za začetek ali PRO za hitrejše spremljanje in SMS obvestila.",
    signupPlanChooseLabel: "Naročniški paket",
    signupPlanFreeOption: "MojTermin FREE — 0 €",
    signupPlanProOption: "MojTermin PRO — 7 € / mesec",
    signupPlanFreePaymentNote:
      "Plačilo ni potrebno. Na PRO lahko nadgradite kadar koli iz računa.",
    signupPlanProPaymentNote:
      "Plačilo še ni aktivno. Račun bo ustvarjen za PRO; plačilo dodamo v naslednjem koraku.",
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
    comingSoon: "Kmalu",
    settingsComingSoonIntro:
      "Nastavitve računa še niso na voljo — ta del prihaja kmalu. Spodaj so samo za branje osnovni podatki.",
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
    dashboardCardHistory: "Zgodovina",
    dashboardCardPlan: "Vaš paket",
    dashboardCardPlanSince: "Od",
    dashboardCardPlanUpgrade: "Nadgradi na PRO",
    dashboardNewRequestTitle: "Preveri razpoložljivost",
    dashboardHistoryTitle: "Vaše zahteve za termin",
    dashboardEmptyHistory: "Še nimate zahtev. Oddajte jo z obrazcom zgoraj.",
    dashboardTableSubmitted: "Oddano",
    dashboardTableStatus: "Stanje",
    dashboardTableHospital: "Zdravstveni zavod",
    dashboardTableNeed: "Kaj ste iskali",
    dashboardTableWhen: "Želen datum",
    dashboardTableActions: "Dejanja",
    dashboardEditPreferredDate: "Uredi datum",
    dashboardSave: "Shrani",
    dashboardCancel: "Prekliči",
    dashboardDelete: "Izbriši",
    dashboardDeleteRequestTitle: "Želite izbrisati to zahtevo?",
    dashboardDeleteRequestBody:
      "Odstranjena bo s seznama. Novo zahtevo lahko oddate kadar koli z nadzorne plošče.",
    dashboardRemoveReferralImageTitle: "Želite odstraniti to sliko?",
    dashboardRemoveReferralImageBody:
      "Izbriše se samo ta datoteka. Zahteva za termin ostane na seznamu.",
    dashboardConfirmRemoveReferralImage: "Odstrani sliko",
    dashboardConfirmDelete: "Izbriši zahtevo",
    dashboardAccountEmail: "Kontakt e-pošta",
    dashboardReferralPhoto: "Slika napotnice (neobvezno)",
    dashboardReferralPhotoHint:
      "JPEG, PNG, GIF ali WebP — do 15 slik po 10 MB. Ob »Preveri razpoložljivost« zaženemo AI-pogled na slike in prikažemo izluščeno vsebino. Z Ctrl/Ukaz izberite več datotek.",
    dashboardReferralAttachedLabel: "Fotografije napotnice",
    dashboardReferralRemoveFromListAria: "Odstrani datoteko s seznama",
    dashboardReferralRemoveImageAria: "Odstrani to sliko iz zahteve",
    dashboardReferralAiPanelTitle: "Iz slik napotnice (AI)",
    dashboardReferralAiPanelHint:
      "Izluščeno za preizkus — preverite z dokumenti. Ni zdravniške diagnoze.",
    dashboardReferralAiError:
      "Analiza slike ni uspela; uporabljen je le vaš opis.",
    dashboardReferralAiDetail: "Podrobnosti (AI)",
    dashboardReferralRawMentions: "Omembe iz dokumenta",
    dashboardReferralSearchLimitNote:
      "Za AI analizo ob preverjanju razpoložljivosti se uporabi prvih 8 slik. Vse izbrane (do 15) se pošljejo ob potrditvi zahteve.",
    dashboardSelectHospital: "Izberi zdravstveni zavod",
    dashboardPreferredAppointmentDate: "Želeni datum termina",
    dashboardEmailNote: "Za to zahtevo uporabimo e-pošto vašega računa.",
    dashboardNotifyCheckbox: "Obvesti me, ko je prost termin (SMS in e-pošta)",
    dashboardNotifyHint:
      "Uporabili bomo e-pošto in telefon iz računa. Samodejna obvestila še niso vključena — shranimo vašo željo.",
    trackingButtonLabel: "Spremljaj termin",
    trackingButtonSubmitting: "Oddajam…",
    trackingEmailCheckbox: "Email obvestila",
    trackingEmailHint: "Po e-pošti vas obvestimo, ko se razpoložljivost izboljša.",
    trackingFasterRefreshCheckbox: "Hitrejše osveževanje",
    trackingFasterRefreshHint: "Pogostejše preverjanje posodobitev čez dan.",
    trackingSmsCheckbox: "SMS obvestila",
    trackingSmsHint: "SMS pošljemo na telefonsko številko iz vašega računa.",
    trackingUpgradeToPro: "Nadgradi na PRO",
    trackingGuestNote:
      "Email obvestila vključena. Hitrejše osveževanje in SMS na voljo s PRO.",
    confirmRequestModalTitle: "Zahteva je oddana",
    confirmRequestModalDescription: "Povzetek zapisa.",
    confirmRequestModalHospital: "Zdravstveni zavod",
    confirmRequestModalEmail: "E-pošta",
    confirmRequestModalPreferredDate: "Želeni datum",
    confirmRequestModalNotifyOn:
      "Ko bo na tem zavodu prost termin, vas bomo obvestili po SMS in e-pošti.",
    confirmRequestModalNotifyOff:
      "Za to zahtevo brez obvestil o prostem mestu.",
    confirmRequestModalOk: "V redu",
    userAreaTagline: "Moja skrb",
    userNavMyAppointments: "Moji termini",
    userLayoutBackHome: "Nazaj na stran",
    userSidebarPlanFree: "MojTermin FREE",
    userSidebarPlanPro: "MojTermin PRO",
    userSidebarUpgradeTitle: "Hitrejši rezultati",
    userSidebarUpgradeBody:
      "Nadgradite na PRO za več spremljanj in takojšnja SMS + email obvestila.",
    userSidebarUpgradeBullets: [
      "Neomejeno spremljanje",
      "Hitrejše osveževanje",
      "SMS + email obvestila",
    ],
    userSidebarUpgradeCta: "Oglej si PRO paket",
    settingsIntro: "Upravljajte profil, geslo in naročnino.",
    settingsTabProfile: "Profil",
    settingsTabPayments: "Zgodovina plačil",
    settingsProfileSection: "Profil",
    settingsEmailReadOnlyHint: "E-pošte tukaj ni mogoče spremeniti.",
    settingsSaveProfile: "Shrani profil",
    settingsProfileSaved: "Profil je posodobljen.",
    settingsPasswordSection: "Geslo",
    settingsCurrentPassword: "Trenutno geslo",
    settingsNewPassword: "Novo geslo",
    settingsSavePassword: "Posodobi geslo",
    settingsPasswordSaved: "Geslo je posodobljeno.",
    settingsSubscriptionSection: "Naročnina",
    settingsUpgradePlan: "Nadgradi na PRO",
    settingsCancelPlan: "Prekliči naročnino",
    settingsCancelPlanTitle: "Preklicati PRO naročnino?",
    settingsCancelPlanBody:
      "Prešli boste na FREE paket. PRO ugodnosti se končajo takoj; plačila dodamo kmalu.",
    settingsCancelPlanConfirm: "Da, prekliči PRO",
    settingsSubscriptionCancelled: "Naročnina je preklicana. Zdaj ste na FREE.",
    settingsPaymentsSection: "Zgodovina plačil",
    settingsPaymentsComingSoon:
      "Pretekla plačila bodo prikazana, ko bo povezano plačevanje. Kmalu na voljo.",
  },
};
