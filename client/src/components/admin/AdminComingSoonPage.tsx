type AdminComingSoonPageProps = {
  title: string;
};

export function AdminComingSoonPage({ title }: AdminComingSoonPageProps) {
  return (
    <section className="rounded-2xl border border-dashed border-gray-300 bg-white p-8">
      <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
      <p className="mt-2 text-sm text-gray-600">Coming soon.</p>
    </section>
  );
}
