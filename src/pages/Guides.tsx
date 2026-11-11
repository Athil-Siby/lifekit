import { guides } from '../config/guides';
import { staticPages } from '../config/pages';
import { useSeo } from '../hooks/useSeo';
import { PageHeader } from '../components/PageHeader';
import { GuideCard } from '../components/GuideCard';

export default function Guides() {
  const meta = staticPages.find((p) => p.path === '/guides')!;
  useSeo({ title: meta.title, description: meta.description, path: meta.path });
  const sorted = [...guides].sort((a, b) => b.date.localeCompare(a.date));
  return (
    <>
      <PageHeader eyebrow="Guides" title="Helpful guides">
        <p>Short, practical how-tos for everyday digital tasks, with the free LifeKit tool to do each one.</p>
      </PageHeader>
      <div className="container-page grid gap-4 py-12 sm:grid-cols-2 lg:grid-cols-3">
        {sorted.map((g) => (
          <GuideCard key={g.slug} guide={g} />
        ))}
      </div>
    </>
  );
}
