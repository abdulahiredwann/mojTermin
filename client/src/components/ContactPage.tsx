import { Mail, MapPin, Phone } from "lucide-react";
import { SiteHeader } from "@/components/SiteHeader";
import { useLanguage } from "@/contexts/LanguageContext";

export default function ContactPage() {
  const { locale } = useLanguage();
  const sl = locale === "sl";

  return (
    <div className="min-h-screen bg-white">
      <SiteHeader />

      <section className="bg-[#ecf7f1] py-16 md:py-24">
        <div className="mx-auto max-w-6xl px-6 md:px-12">
          <h1 className="text-3xl font-bold tracking-tight text-[#18382b] md:text-4xl">
            {sl ? "Kontakt" : "Contact"}
          </h1>
          <p className="mt-4 max-w-2xl text-lg text-gray-800 leading-relaxed">
            {sl
              ? "Smo tukaj, da vam pomagamo. Pišite nam ali nas pokličite."
              : "We are here to help. Write to us or give us a call."}
          </p>
        </div>
      </section>

      <section className="border-t border-[#dceee4] bg-white py-14 md:py-20">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 md:grid-cols-3 md:gap-8 md:px-12">
          <div className="rounded-2xl border border-[#dceee4] bg-[#fafdfb] p-6 shadow-sm">
            <Mail className="h-9 w-9 text-[#2E7D5B]" strokeWidth={2} aria-hidden />
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#2b5b46]">
              {sl ? "E-pošta" : "Email"}
            </p>
            <a href="mailto:info@mojtermin.si" className="mt-2 block text-lg font-semibold text-gray-900 hover:text-[#2E7D5B]">
              info@mojtermin.si
            </a>
          </div>
          <div className="rounded-2xl border border-[#dceee4] bg-[#fafdfb] p-6 shadow-sm">
            <Phone className="h-9 w-9 text-[#2E7D5B]" strokeWidth={2} aria-hidden />
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#2b5b46]">
              {sl ? "Telefon" : "Phone"}
            </p>
            <a href="tel:+38612345678" className="mt-2 block text-lg font-semibold text-gray-900 hover:text-[#2E7D5B]">
              +386 1 234 5678
            </a>
          </div>
          <div className="rounded-2xl border border-[#dceee4] bg-[#fafdfb] p-6 shadow-sm">
            <MapPin className="h-9 w-9 text-[#2E7D5B]" strokeWidth={2} aria-hidden />
            <p className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#2b5b46]">
              {sl ? "Naslov" : "Address"}
            </p>
            <p className="mt-2 text-lg font-semibold text-gray-900">
              {sl ? "Ljubljana, Slovenija" : "Ljubljana, Slovenia"}
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
