import { SiteBottom } from "@/components/app";
import { SiteHeader } from "@/components/SiteHeader";

type SubBlock = { intro: string; list: string[] };
type Section = {
  title: string;
  paragraphs?: string[];
  list?: string[];
  listIntro?: string;
  outro?: string;
  subBlocks?: SubBlock[];
};

const sections: Section[] = [
  {
    title: "1. Upravljavec osebnih podatkov",
    paragraphs: [
      "Upravljavec osebnih podatkov je: MojTermin (v nadaljevanju: \u201Cupravljavec\u201D). Kontakt: info.mojtermin@gmail.com",
      "Upravljavec obdeluje osebne podatke v skladu z veljavno zakonodajo, vključno z Uredbo (EU) 2016/679 (GDPR).",
    ],
  },
  {
    title: "2. Namen obdelave osebnih podatkov",
    listIntro: "Osebne podatke obdelujemo izključno za naslednje namene:",
    list: [
      "zagotavljanje delovanja storitve",
      "obdelava uporabniških zahtevkov (npr. spremljanje terminov)",
      "obveščanje uporabnikov o spremembah razpoložljivosti",
      "izboljšanje uporabniške izkušnje in delovanja aplikacije",
      "zagotavljanje varnosti sistema",
    ],
  },
  {
    title: "3. Pravna podlaga za obdelavo",
    listIntro: "Osebne podatke obdelujemo na podlagi:",
    list: [
      "privolitve uporabnika (člen 6(1)(a) GDPR)",
      "izvajanja storitve (člen 6(1)(b) GDPR)",
      "zakonitega interesa upravljavca (člen 6(1)(f) GDPR), kjer je to primerno",
    ],
  },
  {
    title: "4. Vrste osebnih podatkov",
    paragraphs: ["Obdelujemo naslednje kategorije podatkov:"],
    subBlocks: [
      {
        intro: "4.1 Podatki, ki jih posreduje uporabnik:",
        list: [
          "e-mail naslov",
          "vsebina zahtevka (npr. iskana zdravstvena storitev)",
        ],
      },
      {
        intro: "4.2 Tehnični podatki:",
        list: [
          "IP naslov",
          "podatki o napravi in brskalniku",
          "čas dostopa in uporabe aplikacije",
        ],
      },
    ],
    outro:
      "Upravljavec ne obdeluje posebnih vrst osebnih podatkov (npr. medicinske dokumentacije), razen če jih uporabnik sam prostovoljno posreduje.",
  },
  {
    title: "5. Hranjenje osebnih podatkov",
    listIntro:
      "Osebne podatke hranimo le toliko časa, kolikor je potrebno za dosego namena obdelave, oziroma:",
    list: [
      "dokler uporabnik uporablja storitev",
      "do preklica privolitve ali zahteve za izbris",
      "v skladu z zakonskimi obveznostmi",
    ],
  },
  {
    title: "6. Posredovanje podatkov tretjim osebam",
    listIntro:
      "Osebni podatki se lahko posredujejo tretjim osebam le, kadar je to nujno za delovanje storitve, kot so:",
    list: [
      "ponudniki gostovanja in infrastrukture",
      "ponudniki e-mail storitev",
      "tehnični partnerji",
    ],
    outro:
      "Vsi obdelovalci podatkov so zavezani k varovanju osebnih podatkov in delujejo v skladu z GDPR. Podatkov ne prodajamo tretjim osebam.",
  },
  {
    title: "7. Prenos podatkov izven EU",
    paragraphs: [
      "Podatki se praviloma obdelujejo znotraj Evropske unije.",
      "V primeru prenosa izven EU upravljavec zagotavlja ustrezne zaščitne ukrepe (npr. standardne pogodbene klavzule).",
    ],
  },
  {
    title: "8. Pravice uporabnikov",
    listIntro: "Uporabnik ima pravico do:",
    list: [
      "dostopa do svojih osebnih podatkov",
      "popravka netočnih podatkov",
      "izbrisa podatkov (\u201Cpravica do pozabe\u201D)",
      "omejitve obdelave",
      "prenosljivosti podatkov",
      "ugovora obdelavi",
    ],
    outro: "Zahtevo lahko uporabnik pošlje na kontakt upravljavca.",
  },
  {
    title: "9. Varnost podatkov",
    listIntro:
      "Upravljavec uporablja ustrezne tehnične in organizacijske ukrepe za zaščito osebnih podatkov, vključno z:",
    list: [
      "šifrirano komunikacijo (HTTPS)",
      "nadzorom dostopa",
      "varnim shranjevanjem podatkov",
    ],
  },
  {
    title: "10. Piškotki",
    paragraphs: [
      "Aplikacija uporablja piškotke za zagotavljanje delovanja in izboljšanje uporabniške izkušnje.",
      "Podrobnosti so navedene v Politiki piškotkov.",
    ],
  },
  {
    title: "11. Spremembe politike zasebnosti",
    paragraphs: [
      "Upravljavec si pridržuje pravico do spremembe te politike.",
      "Spremembe začnejo veljati z objavo na spletni strani.",
    ],
  },
];

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader logoSize="xl" />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Politika zasebnosti – MojTermin
          </h1>
          <div className="mt-10 space-y-10 text-base leading-relaxed text-muted-foreground">
            {sections.map((s) => (
              <section key={s.title}>
                <h2 className="text-xl font-semibold text-foreground">{s.title}</h2>
                <div className="mt-4 space-y-4">
                  {s.paragraphs?.map((p, i) => (
                    <p key={i}>{p}</p>
                  ))}
                  {s.listIntro ? <p>{s.listIntro}</p> : null}
                  {s.list ? (
                    <ul className="list-disc space-y-1 pl-6">
                      {s.list.map((item, i) => (
                        <li key={i}>{item}</li>
                      ))}
                    </ul>
                  ) : null}
                  {s.subBlocks?.map((b, i) => (
                    <div key={i} className="space-y-2">
                      <p className="font-medium text-foreground">{b.intro}</p>
                      <ul className="list-disc space-y-1 pl-6">
                        {b.list.map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                  {s.outro ? <p>{s.outro}</p> : null}
                </div>
              </section>
            ))}
          </div>
        </article>
      </main>
      <SiteBottom />
    </div>
  );
}
