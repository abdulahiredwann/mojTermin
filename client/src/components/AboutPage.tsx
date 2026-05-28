import { Link } from "react-router-dom";
import { Heart, ShieldCheck, Sparkles, Clock } from "lucide-react";
import { SiteBottom } from "@/components/app";
import { SiteHeader } from "@/components/SiteHeader";
import { Button } from "@/components/ui/button";

const values = [
  {
    icon: ShieldCheck,
    title: "Zasebnost",
    text: "Vaši podatki so varni. Z njimi ravnamo odgovorno in transparentno.",
  },
  {
    icon: Sparkles,
    title: "Preglednost",
    text: "Brez skritih trikov. Jasno povemo, kaj počnemo in kako.",
  },
  {
    icon: Clock,
    title: "Prihranek časa",
    text: "Avtomatsko spremljanje terminov, da vam ni treba klicati in preverjati.",
  },
  {
    icon: Heart,
    title: "Skrb za uporabnika",
    text: "Tehnologija deluje v ozadju - vi se osredotočite na svoje zdravje.",
  },
];

export default function AboutPage() {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader logoSize="xl" />
      <main className="flex-1">
        <section className="relative overflow-hidden">
          <div className="absolute inset-0 -z-10 bg-gradient-to-br from-[#2E7D5B]/10 via-white to-[#d7ebdc]/40" />
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 sm:py-20 lg:grid-cols-2 lg:gap-16">
            <div>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#2E7D5B]/10 px-3 py-1 text-xs font-medium text-[#2E7D5B]">
                <Sparkles className="h-3.5 w-3.5" />
                Naša zgodba
              </span>
              <h1 className="mt-4 text-4xl font-extrabold tracking-tight text-[#18382b] sm:text-5xl">
                O nas
              </h1>
              <p className="mt-5 text-lg leading-relaxed text-gray-700">
                MojTermin je nastal iz preproste, a zelo pogoste izkušnje:
                dolgo čakanje na zdravstveni pregled in občutek, da obstajajo
                hitrejše možnosti - a jih je težko najti.
              </p>
            </div>
            <div className="relative">
              <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-tr from-[#2E7D5B]/20 to-[#d7ebdc]/30 blur-2xl" />
              <img
                src="/Images/o-nas-hero.jpg"
                alt="Ilustracija pacientke, ki na telefonu preverja termin"
                width={1280}
                height={896}
                className="aspect-[16/11] w-full rounded-3xl object-cover shadow-xl ring-1 ring-[#dceee4]"
              />
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-3xl px-6 py-16">
          <p className="text-lg leading-relaxed text-gray-700">
            Verjamemo, da dostop do zdravstva ne bi smel biti odvisen od tega,
            koliko časa ima nekdo za raziskovanje, klicanje ali stalno
            preverjanje terminov. Informacije obstajajo, vendar so razpršene,
            nepregledne in pogosto težko dostopne.
          </p>
          <p className="mt-6 text-2xl font-semibold text-[#18382b]">
            Zato smo ustvarili MojTermin.
          </p>
        </section>

        <section className="bg-[#f6fbf8] py-16">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-6 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <img
                src="/Images/o-nas-secondary.jpg"
                alt="Ilustracija telefona z obvestilom o terminu"
                width={1024}
                height={1024}
                loading="lazy"
                className="mx-auto aspect-square w-full max-w-sm rounded-3xl object-cover shadow-md ring-1 ring-[#dceee4]"
              />
            </div>
            <div className="order-1 lg:order-2">
              <h2 className="text-3xl font-bold text-[#18382b]">
                Naše poslanstvo
              </h2>
              <p className="mt-4 text-base leading-relaxed text-gray-700">
                Naš cilj je poenostaviti ta proces. Aplikacija spremlja
                razpoložljivost terminov in vas obvesti, ko se pojavi boljša
                možnost. Tako lahko hitreje pridete do pregleda, brez
                nepotrebnega stresa in izgube časa.
              </p>
              <p className="mt-4 text-base leading-relaxed text-gray-700">
                Ne nadomeščamo zdravstvenega sistema in ne posegamo v delo
                zdravstvenih ustanov. Naša vloga je preprosta: pomagati vam, da
                lažje najdete pot do storitve, ki jo potrebujete.
              </p>
            </div>
          </div>
        </section>

        <section className="mx-auto max-w-6xl px-6 py-16">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold text-[#18382b]">
              Kar nam je pomembno
            </h2>
            <p className="mt-3 text-gray-600">
              Pri razvoju dajemo velik poudarek zasebnosti, preglednosti in
              enostavni uporabi. Verjamemo, da mora tehnologija delovati v
              ozadju - tako, da je za uporabnika čim bolj preprosta.
            </p>
          </div>
          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {values.map(({ icon: Icon, title, text }) => (
              <div
                key={title}
                className="group rounded-2xl bg-white p-6 shadow-sm ring-1 ring-[#dceee4] transition hover:-translate-y-1 hover:shadow-md"
              >
                <div className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-[#2E7D5B]/10 text-[#2E7D5B]">
                  <Icon className="h-5 w-5" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-[#18382b]">
                  {title}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-gray-600">
                  {text}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-6 pb-20">
          <div className="mx-auto max-w-4xl overflow-hidden rounded-3xl bg-gradient-to-br from-[#2E7D5B] to-[#256B4D] p-10 text-white shadow-xl sm:p-14">
            <p className="text-base leading-relaxed opacity-90">
              MojTermin je še v razvoju, zato aktivno poslušamo povratne
              informacije in izboljšujemo storitev skupaj z uporabniki.
            </p>
            <h2 className="mt-4 text-3xl font-bold">
              Imate vprašanje, predlog ali idejo?
            </h2>
            <p className="mt-3 text-base opacity-90">
              Pišite nam - veseli bomo vsakega odziva.
            </p>
            <div className="mt-6">
              <Button asChild size="lg" variant="secondary" className="rounded-full font-semibold text-[#2E7D5B]">
                <Link to="/contact">Kontakt</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <SiteBottom />
    </div>
  );
}
