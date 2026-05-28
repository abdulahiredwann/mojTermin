import { SiteHeader } from "@/components/SiteHeader";
import { SiteBottom } from "@/components/app";

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <section className="bg-[#ecf7f1] py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <h1 className="text-3xl font-bold tracking-tight text-[#18382b] md:text-4xl">
            PODSTRAN: VEČ O PIŠKOTKIH
          </h1>
          <p className="mt-2 text-lg font-medium text-[#2b5b46]">🍪 Politika piškotkov</p>
          <p className="mt-5 max-w-4xl leading-relaxed text-gray-700">
            Na spletni strani MojTermin uporabljamo piškotke za zagotavljanje pravilnega delovanja,
            izboljšanje uporabniške izkušnje in analizo uporabe.
          </p>
        </div>
      </section>

      <section className="border-t border-[#dceee4] bg-white py-14 md:py-20">
        <div className="mx-auto max-w-6xl space-y-10 px-6 md:px-12">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">🔍 Kaj so piškotki?</h2>
            <p className="mt-4 max-w-4xl leading-relaxed text-gray-700">
              Piškotki so majhne tekstovne datoteke, ki se shranijo na vašo napravo ob obisku spletne strani.
              Omogočajo delovanje osnovnih funkcij in zbiranje anonimnih podatkov o uporabi.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">⚙️ Katere piškotke uporabljamo?</h2>
            <div className="mt-5 space-y-6">
              <div className="rounded-2xl border border-[#dceee4] bg-[#fafdfb] p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">1. Nujni piškotki</h3>
                <p className="mt-2 leading-relaxed text-gray-700">
                  Ti piškotki so potrebni za delovanje spletne strani in jih ni mogoče izklopiti.
                </p>
                <p className="mt-2 font-medium text-gray-800">Uporabljajo se za:</p>
                <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
                  <li>prijavo uporabnika</li>
                  <li>varnost</li>
                  <li>osnovno delovanje strani</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-[#dceee4] bg-[#fafdfb] p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">2. Analitični piškotki</h3>
                <p className="mt-2 leading-relaxed text-gray-700">
                  Pomagajo nam razumeti, kako uporabniki uporabljajo spletno stran.
                </p>
                <p className="mt-2 font-medium text-gray-800">Uporabljajo se za:</p>
                <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
                  <li>merjenje obiska</li>
                  <li>izboljšanje funkcionalnosti</li>
                  <li>analizo vedenja uporabnikov</li>
                </ul>
              </div>

              <div className="rounded-2xl border border-[#dceee4] bg-[#fafdfb] p-6 shadow-sm">
                <h3 className="text-lg font-semibold text-gray-900">3. Funkcionalni piškotki</h3>
                <p className="mt-2 leading-relaxed text-gray-700">
                  Omogočajo boljšo uporabniško izkušnjo.
                </p>
                <p className="mt-2 font-medium text-gray-800">Uporabljajo se za:</p>
                <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
                  <li>shranjevanje nastavitev</li>
                  <li>prilagajanje vsebine</li>
                </ul>
              </div>
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">🔐 Kako upravljate piškotke?</h2>
            <p className="mt-4 leading-relaxed text-gray-700">Piškotke lahko upravljate:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li>preko nastavitev v bannerju</li>
              <li>preko nastavitev vašega brskalnika</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">📊 Piškotki tretjih oseb</h2>
            <p className="mt-4 max-w-4xl leading-relaxed text-gray-700">
              Za analitiko lahko uporabljamo storitve tretjih ponudnikov (npr. Google Analytics), ki lahko
              zbirajo anonimne podatke o uporabi.
            </p>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">🗑️ Kako onemogočiti piškotke?</h2>
            <p className="mt-4 leading-relaxed text-gray-700">Večina brskalnikov omogoča:</p>
            <ul className="mt-2 list-disc space-y-1 pl-6 text-gray-700">
              <li>blokiranje piškotkov</li>
              <li>brisanje piškotkov</li>
              <li>nastavitev opozoril</li>
            </ul>
          </div>

          <div>
            <h2 className="text-2xl font-bold text-gray-900">📅 Spremembe politike</h2>
            <p className="mt-4 max-w-4xl leading-relaxed text-gray-700">
              Politiko piškotkov lahko občasno posodobimo. Priporočamo, da jo občasno pregledate.
            </p>
          </div>
        </div>
      </section>

      <SiteBottom />
    </div>
  );
}
