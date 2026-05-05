import { SiteHeader } from "@/components/SiteHeader";
import { useLanguage } from "@/contexts/LanguageContext";

export default function AboutPage() {
  const { locale } = useLanguage();
  const sl = locale === "sl";

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <section className="bg-[#ecf7f1] py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <h1 className="text-3xl font-bold tracking-tight text-[#18382b] md:text-4xl">
            {sl ? "O nas" : "About us"}
          </h1>
          <p className="mt-5 max-w-3xl text-lg leading-relaxed text-gray-800">
            {sl
              ? "Smo ekipa, ki verjame, da mora biti pot do zdravstvene oskrbe preprosta, hitra in dostopna vsem. MojTermin združuje sodobno tehnologijo umetne inteligence s skrbjo za pacienta."
              : "We are a team that believes the path to care should be simple, fast, and accessible to everyone. MojTermin combines modern AI technology with thoughtful attention to patients."}
          </p>
        </div>
      </section>

      <section className="border-t border-[#dceee4] bg-white py-14 md:py-20">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <h2 className="text-2xl font-bold text-gray-900 md:text-3xl">{sl ? "Naše poslanstvo" : "Our mission"}</h2>
          <p className="mt-4 max-w-3xl text-gray-700 leading-relaxed">
            {sl
              ? "Skrajšati pot do zdravniškega termina in razbremeniti paciente administrativnih ovir."
              : "Shorten the journey to your appointment and remove administrative hurdles for patients."}
          </p>

          <h2 className="mt-14 text-2xl font-bold text-gray-900 md:text-3xl">
            {sl ? "Naše vrednote" : "Our values"}
          </h2>
          <p className="mt-4 max-w-3xl text-gray-700 leading-relaxed">
            {sl
              ? "Zaupanje, zasebnost, dostopnost in nenehno izboljševanje uporabniške izkušnje."
              : "Trust, privacy, accessibility, and continuous improvement of the user experience."}
          </p>
        </div>
      </section>
    </div>
  );
}
