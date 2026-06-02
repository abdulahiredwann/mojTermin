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
    title: "1. Splošne določbe",
    paragraphs: [
      "Ti pogoji uporabe (v nadaljevanju: \u201CPogoji\u201D) urejajo dostop do in uporabo spletne aplikacije MojTermin (v nadaljevanju: \u201Cstoritev\u201D).",
      "Z uporabo storitve potrjujete, da ste prebrali, razumeli in se strinjate s temi Pogoji. Če se s Pogoji ne strinjate, storitve ne smete uporabljati.",
    ],
  },
  {
    title: "2. Opis storitve",
    paragraphs: [
      "MojTermin je digitalna platforma, namenjena spremljanju razpoložljivosti zdravstvenih storitev in obveščanju uporabnikov o potencialno zgodnejših terminih.",
    ],
    listIntro: "Storitev:",
    list: [
      "ne omogoča neposredne rezervacije terminov",
      "ne zagotavlja zdravstvenih storitev",
      "ne nadomešča komunikacije z zdravstvenimi izvajalci",
    ],
  },
  {
    title: "3. Dostop in registracija",
    paragraphs: [
      "Za uporabo določenih funkcionalnosti je potrebna registracija uporabniškega računa.",
    ],
    listIntro: "Uporabnik se zavezuje, da bo:",
    list: [
      "podal točne, popolne in ažurne podatke",
      "varoval svoje dostopne podatke",
      "odgovoren za vse aktivnosti na svojem računu",
    ],
  },
  {
    title: "4. Uporaba storitve",
    listIntro: "Uporabnik se zavezuje, da storitve ne bo uporabljal:",
    list: [
      "v nasprotju z veljavno zakonodajo",
      "za zlorabe ali poskuse nepooblaščenega dostopa",
      "za pošiljanje zavajajočih ali neresničnih podatkov",
    ],
    outro:
      "Ponudnik si pridržuje pravico do omejitve ali prekinitve dostopa v primeru kršitev.",
  },
  {
    title: "5. Točnost in razpoložljivost podatkov",
    paragraphs: [
      "Podatki o razpoložljivosti terminov temeljijo na javno dostopnih informacijah, ocenah ali drugih virih.",
    ],
    listIntro: "Ponudnik:",
    list: [
      "ne jamči za popolno točnost, ažurnost ali popolnost podatkov",
      "ne odgovarja za spremembe ali napake pri izvajalcih zdravstvenih storitev",
    ],
    outro: "Uporabnik je dolžan preveriti vse informacije neposredno pri izvajalcu.",
  },
  {
    title: "6. Obvestila",
    paragraphs: [
      "Storitev lahko uporabniku pošilja obvestila (npr. po elektronski pošti ali drugih komunikacijskih kanalih), kadar zazna spremembe v razpoložljivosti terminov.",
    ],
    listIntro: "Ponudnik ne jamči:",
    list: [
      "da bodo obvestila poslana pravočasno",
      "da bodo zajele vse spremembe",
    ],
  },
  {
    title: "7. Omejitev odgovornosti",
    listIntro:
      "V največjem obsegu, ki ga dovoljuje zakonodaja, ponudnik ne odgovarja za:",
    list: [
      "neposredno ali posredno škodo, ki izhaja iz uporabe storitve",
      "izgubo podatkov, priložnosti ali dobička",
      "kakršnekoli odločitve uporabnika na podlagi informacij iz storitve",
    ],
  },
  {
    title: "8. Intelektualna lastnina",
    paragraphs: [
      "Vsa vsebina storitve, vključno z zasnovo, funkcionalnostmi, besedili in programsko kodo, je zaščitena in je last ponudnika.",
    ],
    listIntro: "Brez predhodnega pisnega dovoljenja ni dovoljeno:",
    list: ["kopiranje", "distribucija", "komercialna uporaba vsebine"],
  },
  {
    title: "9. Spremembe storitve",
    listIntro: "Ponudnik si pridržuje pravico, da:",
    list: [
      "spremeni ali nadgradi storitev",
      "začasno ali trajno prekine dostop do storitve",
      "spremeni te Pogoje",
    ],
    outro: "O bistvenih spremembah bodo uporabniki obveščeni na primeren način.",
  },
  {
    title: "10. Prenehanje uporabe",
    paragraphs: [
      "Uporabnik lahko kadarkoli preneha uporabljati storitev.",
      "Ponudnik si pridržuje pravico do začasne ali trajne ukinitve dostopa uporabniku v primeru kršitev teh Pogojev.",
    ],
  },
  {
    title: "11. Veljavna zakonodaja in pristojnost",
    paragraphs: [
      "Za te Pogoje se uporablja pravo Republike Slovenije.",
      "Za reševanje sporov so pristojna sodišča v Republiki Sloveniji.",
    ],
  },
];

export default function TermsPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader logoSize="xl" />
      <main className="flex-1">
        <article className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <h1 className="text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
            Pogoji uporabe – MojTermin
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
