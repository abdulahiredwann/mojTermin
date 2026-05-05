import { SiteHeader } from "@/components/SiteHeader";
import { useLanguage } from "@/contexts/LanguageContext";

export default function PrivacyPage() {
  const { locale } = useLanguage();
  const isSl = locale === "sl";

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <section className="bg-[#ecf7f1] py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <h1 className="text-3xl md:text-4xl font-bold text-[#18382b]">{isSl ? "Vaša zasebnost" : "Your privacy"}</h1>
          <p className="mt-2 text-lg font-medium text-[#2b5b46]">
            {isSl ? "Zaščita, ki ji lahko zaupate." : "Protection you can trust."}
          </p>
          <p className="mt-5 max-w-4xl leading-relaxed text-gray-700">
            {isSl
              ? "Zasebnost je ena ključnih vrednot naše aplikacije. Zavedamo se, da so podatki, povezani z zdravjem, izjemno občutljivi, zato z njimi ravnamo odgovorno, varno in transparentno."
              : "Privacy is one of our core values. We understand that health-related data is highly sensitive, so we handle it responsibly, securely, and transparently."}
          </p>
          <p className="mt-4 max-w-4xl leading-relaxed text-gray-700">
            {isSl
              ? "Vaše podatke uporabljamo izključno za to, da vam pomagamo najti hitrejši termin za zdravstveno storitev."
              : "We use your data exclusively to help you find a faster healthcare appointment."}
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            {[isSl ? "Strežniki v Sloveniji" : "Servers in Slovenia", "GDPR", isSl ? "Šifriranje od konca do konca" : "End-to-end encryption"].map((tag) => (
              <span
                key={tag}
                className="rounded-full border border-[#b8dbc9] bg-white px-4 py-2 text-sm font-medium text-[#2b5b46]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 md:py-20">
        <div className="mx-auto max-w-6xl space-y-12 px-6 md:px-12">
          {[
            {
              num: "01",
              img: "/Images/privacy-europe.png",
              title: isSl ? "Lokacija podatkov" : "Data location",
              subtitle: isSl ? "Podatki so shranjeni in zaščiteni v Evropi." : "Data is stored and protected in Europe.",
              p1: isSl
                ? "Podatki so shranjeni na strežnikih v Sloveniji. Podatkovni centri izpolnjujejo najvišje mednarodne varnostne standarde."
                : "Data is stored on servers in Slovenia. Data centers meet high international security standards.",
              p2: isSl
                ? "Storitve MojTermin so skladne z evropskimi in nacionalnimi predpisi o varstvu podatkov."
                : "MojTermin services comply with European and national data protection regulations.",
            },
            {
              num: "02",
              img: "/Images/privacy-process.png",
              title: isSl ? "Procesi in nadzor" : "Processes and controls",
              subtitle: isSl ? "Varstvo podatkov je v središču vsake nove storitve." : "Data protection is at the center of every new service.",
              p1: isSl
                ? "Vsaka nova dejavnost obdelave in vsaka tehnična sprememba je podvržena standardiziranemu postopku testiranja in ocenjevanja."
                : "Each new processing activity and every technical change goes through standardized testing and review.",
              p2: isSl
                ? "Tehnični in organizacijski ukrepi, kot so šifriranje, nadzor dostopa in revizije, so standardno integrirani."
                : "Technical and organizational measures such as encryption, access control, and audits are integrated by default.",
            },
            {
              num: "03",
              img: "/Images/privacy-ai.png",
              title: isSl ? "Upravljanje podatkov" : "Data governance",
              subtitle: isSl ? "Odgovorno ravnanje s podatki." : "Responsible handling of data.",
              p1: isSl
                ? "Kot obdelovalec podatkov MojTermin obdeluje podatke izključno v skladu z navodili zdravstvenih delavcev. Dostop do njih imajo le zdravstvene ekipe in pacienti."
                : "As a data processor, MojTermin handles data only according to healthcare professionals' instructions. Access is limited to care teams and patients.",
              p2: isSl
                ? "Vaše podatke varujemo z modernimi tehničnimi in organizacijskimi ukrepi: šifrirana komunikacija (HTTPS), omejen dostop do podatkov, varno shranjevanje podatkov."
                : "Your data is protected with modern technical and organizational safeguards: encrypted communication (HTTPS), restricted access, and secure storage.",
            },
            {
              num: "04",
              img: "/Images/privacy-lock.png",
              title: isSl ? "OBČUTLJIVI PODATKI" : "SENSITIVE DATA",
              subtitle: isSl ? "Maksimalna varnost za občutljive zdravstvene podatke." : "Maximum protection for sensitive healthcare data.",
              p1: isSl
                ? "MojTermin varuje občutljive zdravstvene podatke z jasnim poudarkom na varstvu podatkov, varnosti podatkov in skladnosti s predpisi."
                : "MojTermin protects sensitive healthcare data with a strong focus on privacy, data security, and regulatory compliance.",
              p2: isSl ? "Zaupanje gradimo z vsako podrobnostjo — od kode do procesov." : "We build trust in every detail — from code to processes.",
            },
          ].map((item, idx) => (
            <article
              key={item.num}
              className={`grid items-center gap-8 rounded-3xl border border-[#dceee4] p-6 md:grid-cols-2 md:p-10 ${
                idx % 2 === 0 ? "bg-[#f4fbf7]" : "bg-white"
              }`}
            >
              <div className={idx % 2 === 1 ? "md:order-2" : ""}>
                <p className="text-sm font-semibold tracking-wider text-[#2E7D5B]">
                  {item.num} — {item.title}
                </p>
                <h3 className="mt-2 text-2xl font-bold text-gray-900">{item.subtitle}</h3>
                <p className="mt-4 leading-relaxed text-gray-700">{item.p1}</p>
                <p className="mt-3 leading-relaxed text-gray-700">{item.p2}</p>
              </div>
              <div className={`flex justify-center ${idx % 2 === 1 ? "md:order-1" : ""}`}>
                <img
                  src={item.img}
                  alt=""
                  width={512}
                  height={512}
                  loading="lazy"
                  className="h-48 w-48 object-contain md:h-56 md:w-56"
                />
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
