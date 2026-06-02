import { SiteBottom } from "@/components/app";
import { SiteHeader } from "@/components/SiteHeader";
import { ClipboardCheck, Lock, Server, ShieldCheck, Sparkles } from "lucide-react";

type Section = {
  eyebrow: string;
  title: string;
  paragraphs: string[];
  image: string;
  alt: string;
  icon: typeof Server;
};

const sections: Section[] = [
  {
    eyebrow: "01 - Lokacija podatkov",
    title: "Podatki so shranjeni in zaščiteni v Evropi.",
    paragraphs: [
      "Podatki so shranjeni na strežnikih v Sloveniji. Podatkovni centri izpolnjujejo najvišje mednarodne varnostne standarde.",
      "Storitve MojTermin so skladne z evropskimi in nacionalnimi predpisi o varstvu podatkov.",
      "Zaščita, ki je celovita, pregledna in se nenehno izboljšuje.",
    ],
    image: "/Images/privacy-europe.png",
    alt: "Ilustracija zaščitenega podatkovnega strežnika v Sloveniji",
    icon: Server,
  },
  {
    eyebrow: "02 - Procesi in nadzor",
    title: "Varstvo podatkov je v središču vsake nove storitve.",
    paragraphs: [
      "Vsaka nova dejavnost obdelave in vsaka tehnična sprememba je podvržena standardiziranemu postopku testiranja in ocenjevanja.",
      "Tehnični in organizacijski ukrepi, kot so šifriranje, nadzor dostopa in revizije, so standardno integrirani.",
    ],
    image: "/Images/privacy-process.png",
    alt: "Ilustracija postopka preverjanja in revizije varnosti",
    icon: ClipboardCheck,
  },
  {
    eyebrow: "03 - Upravljanje podatkov",
    title: "Odgovorno ravnanje s podatki.",
    paragraphs: [
      "Kot obdelovalec podatkov MojTermin obdeluje podatke izključno v skladu z navodili zdravstvenih delavcev. Dostop do njih imajo le zdravstvene ekipe in pacienti.",
      "Vaše podatke varujemo z modernimi tehničnimi in organizacijskimi ukrepi: šifrirana komunikacija (HTTPS), omejen dostop do podatkov, varno shranjevanje podatkov.",
    ],
    image: "/Images/privacy-ai.png",
    alt: "Ilustracija upravljanja podatkov",
    icon: Sparkles,
  },
  {
    eyebrow: "04 - OBČUTLJIVI PODATKI",
    title: "Maksimalna varnost za občutljive zdravstvene podatke.",
    paragraphs: [
      "MojTermin varuje občutljive zdravstvene podatke z jasnim poudarkom na varstvu podatkov, varnosti podatkov in skladnosti s predpisi. Zdravstveni podatki se hranijo izključno znotraj Slovenije, obdelujejo v skladu z GDPR in so zaupno zaščiteni na najvišji ravni varnosti.",
      "Kot obdelovalec podatkov MojTermin obdeluje podatke izključno v skladu z navodili zdravstvenih delavcev. Dostop do njih imajo le zdravstvene ekipe in pacienti.",
      "Vaše podatke varujemo z modernimi tehničnimi in organizacijskimi ukrepi: šifrirana komunikacija (HTTPS), omejen dostop do podatkov, varno shranjevanje podatkov.",
    ],
    image: "/Images/privacy-lock.png",
    alt: "Ilustracija ključavnice nad zdravstvenim dokumentom",
    icon: Lock,
  },
];

const pillars = [
  { icon: Server, label: "Strežniki v Sloveniji" },
  { icon: ShieldCheck, label: "Skladnost z GDPR" },
  { icon: Lock, label: "Šifriranje od konca do konca" },
];

export default function PrivacyPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader logoSize="xl" />
      <main className="flex-1">
        <section className="relative overflow-hidden bg-[#ecf7f1]">
          <div className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-20 md:grid-cols-[1.2fr_1fr] md:py-24">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-white/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-[#2E7D5B] ring-1 ring-[#dceee4] backdrop-blur-sm">
                <ShieldCheck className="h-3.5 w-3.5" />
                Vaša zasebnost
              </span>
              <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-[#18382b] sm:text-5xl">
                Zaščita, ki ji lahko zaupate.
              </h1>
              <div className="mt-5 max-w-lg space-y-4 text-base text-gray-700">
                <p>
                  Zasebnost je ena ključnih vrednot naše aplikacije. Zavedamo se, da so podatki,
                  povezani z zdravjem, izjemno občutljivi, zato z njimi ravnamo odgovorno, varno
                  in transparentno.
                </p>
                <p>
                  Vaše podatke uporabljamo izključno za to, da vam pomagamo najti hitrejši termin
                  za zdravstveno storitev.
                </p>
              </div>
              <div className="mt-8 flex flex-wrap gap-3">
                {pillars.map((p) => (
                  <div
                    key={p.label}
                    className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-[#18382b] shadow-sm ring-1 ring-[#dceee4]"
                  >
                    <p.icon className="h-4 w-4 text-[#2E7D5B]" />
                    {p.label}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex justify-center md:justify-end">
              <div className="relative">
                <div
                  aria-hidden
                  className="absolute inset-0 -z-10 rounded-full bg-[#d7ebdc] blur-2xl"
                />
                <div className="flex h-64 w-64 items-center justify-center rounded-full bg-white shadow-sm ring-1 ring-[#dceee4] sm:h-72 sm:w-72">
                  <ShieldCheck className="h-28 w-28 text-[#2E7D5B]" strokeWidth={1.5} />
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className="bg-white">
          {sections.map((s, i) => {
            const reversed = i % 2 === 1;
            const Icon = s.icon;
            return (
              <section
                key={s.title}
                className={`relative overflow-hidden ${i % 2 === 1 ? "bg-[#f6fbf8]" : "bg-white"}`}
              >
                <div className="relative mx-auto max-w-6xl px-6 py-20 md:py-24">
                  <div
                    className={`grid items-center gap-12 md:grid-cols-2 ${
                      reversed ? "md:[&>*:first-child]:order-2" : ""
                    }`}
                  >
                    <div className="flex justify-center">
                      <div className="relative">
                        <div
                          aria-hidden
                          className="absolute inset-6 -z-10 rounded-[2.5rem] bg-[#d7ebdc]/70 blur-xl"
                        />
                        <div className="rounded-[2.5rem] bg-white p-6 shadow-sm ring-1 ring-[#dceee4] sm:p-8">
                          <img
                            src={s.image}
                            alt={s.alt}
                            width={896}
                            height={896}
                            loading="lazy"
                            className="mx-auto h-56 w-56 object-contain sm:h-72 sm:w-72"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <div className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#2E7D5B]">
                        <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#e8f5ee]">
                          <Icon className="h-3.5 w-3.5" />
                        </span>
                        {s.eyebrow}
                      </div>
                      <h2 className="mt-4 text-2xl font-bold leading-tight text-[#18382b] sm:text-3xl">
                        {s.title}
                      </h2>
                      <div className="mt-5 space-y-4 text-base leading-relaxed text-gray-700">
                        {s.paragraphs.map((p, j) => (
                          <p key={j}>{p}</p>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </section>
            );
          })}
        </div>

        <section className="bg-white pb-20">
          <div className="mx-auto max-w-3xl px-6">
            <div className="flex min-h-[200px] flex-col items-center justify-center rounded-2xl bg-[#f6fbf8] p-8 text-center ring-1 ring-[#dceee4] sm:p-10">
              <ShieldCheck className="h-10 w-10 text-[#2E7D5B]" strokeWidth={1.75} />
              <p className="mt-4 max-w-xl text-base font-medium text-[#18382b] sm:text-lg">
                Zaupanje gradimo z vsako podrobnostjo - od kode do procesov.
              </p>
            </div>
          </div>
        </section>
      </main>
      <SiteBottom />
    </div>
  );
}
