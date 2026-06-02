import { SiteBottom } from "@/components/app";
import { SiteHeader } from "@/components/SiteHeader";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { HelpCircle } from "lucide-react";

type Faq = { q: string; a: string[]; list?: string[] };

const faqs: Faq[] = [
  {
    q: "Kako deluje MojTermin?",
    a: [
      "Vnesete, katero zdravstveno storitev iščete (npr. MRI, dermatolog), mi pa spremljamo razpoložljivost terminov in vas obvestimo, ko se pojavi hitrejša možnost.",
    ],
  },
  {
    q: "Ali lahko preko vas rezerviram termin?",
    a: [
      "Ne. MojTermin ne omogoča neposredne rezervacije.",
      "Ko najdemo primeren termin, vas obvestimo, rezervacijo pa opravite sami pri izvajalcu.",
    ],
  },
  {
    q: "Kako hitro dobim obvestilo?",
    a: [
      "Obvestilo prejmete takoj, ko zaznamo spremembo v razpoložljivosti.",
      "Hitrost je odvisna od paketa in pogostosti spremljanja.",
    ],
  },
  {
    q: "Katere podatke potrebujem za uporabo?",
    a: ["Potrebujete le:"],
    list: ["kaj iščete (npr. storitev ali pregled)", "vaš email za obvestila"],
  },
  {
    q: "Ali so podatki vedno točni?",
    a: [
      "Trudimo se zagotavljati čim bolj točne in ažurne informacije, vendar ne moremo jamčiti za popolno točnost.",
      "Vedno priporočamo, da termin preverite neposredno pri izvajalcu.",
    ],
  },
  {
    q: "Ali je storitev brezplačna?",
    a: [
      "Osnovna uporaba je brezplačna.",
      "Napredne funkcije (npr. hitrejša obvestila ali več spremljanj) so lahko na voljo v plačljivem paketu.",
    ],
  },
  {
    q: "Kako dolgo spremljate moj zahtevek?",
    a: [
      "Vaš zahtevek spremljamo, dokler ga ne izklopite ali dokler ne najdemo ustreznega termina (odvisno od nastavitev).",
    ],
  },
  {
    q: "Ali lahko spremljam več storitev hkrati?",
    a: ["Da, v plačljivih paketih lahko spremljate več zahtevkov hkrati."],
  },
  {
    q: "Kako lahko izbrišem svoj račun?",
    a: ["Račun lahko izbrišete v nastavitvah profila ali nas kontaktirate."],
  },
  {
    q: "Ali moje podatke delite z drugimi?",
    a: [
      "Ne. Vaših podatkov ne prodajamo in jih uporabljamo izključno za delovanje storitve.",
    ],
  },
  {
    q: "Kaj če ne dobim nobenega termina?",
    a: [
      "To pomeni, da trenutno ni boljše razpoložljivosti. Sistem še naprej spremlja in vas obvesti, če se pojavi nova možnost.",
    ],
  },
];

export default function PomocPage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader logoSize="xl" />
      <main className="flex-1">
        <section className="mx-auto max-w-3xl px-6 py-16 sm:py-20">
          <div className="flex flex-col items-center text-center">
            <span className="flex h-14 w-14 items-center justify-center rounded-full bg-secondary text-primary">
              <HelpCircle className="h-7 w-7" />
            </span>
            <h1 className="mt-6 text-3xl font-extrabold tracking-tight text-foreground sm:text-4xl">
              Pomoč / Pogosta vprašanja
            </h1>
            <p className="mt-4 max-w-xl text-muted-foreground">
              Odgovori na najpogostejša vprašanja o uporabi storitve MojTermin.
            </p>
          </div>

          <Accordion
            type="single"
            collapsible
            className="mt-12 space-y-3"
            defaultValue="item-0"
          >
            {faqs.map((f, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-2xl border border-border bg-card px-5 shadow-sm"
              >
                <AccordionTrigger className="py-4 text-left text-base font-semibold text-foreground hover:no-underline">
                  {f.q}
                </AccordionTrigger>
                <AccordionContent className="pb-5 text-muted-foreground">
                  <div className="space-y-3 text-base leading-relaxed">
                    {f.a.map((p, j) => (
                      <p key={j}>{p}</p>
                    ))}
                    {f.list ? (
                      <ul className="list-disc space-y-1 pl-6">
                        {f.list.map((item, j) => (
                          <li key={j}>{item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </section>
      </main>
      <SiteBottom />
    </div>
  );
}
