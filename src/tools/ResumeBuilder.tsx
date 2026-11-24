import { useEffect, useState } from 'react';
import { FileDown, Plus, X } from 'lucide-react';
import { resumePdf, type Resume, type ResumeEntry } from '../lib/docPdf';
import { readStorage, writeStorage } from '../lib/storage';
import { downloadBlob } from '../utils/download';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Form';
import { useToast } from '../components/ui/Toast';

const sample: Resume = {
  name: 'Aisha Khan', headline: 'Computer Science Student | Frontend Developer', email: 'aisha.khan@email.com', phone: '+91 98765 43210', location: 'Bengaluru, India', link: 'linkedin.com/in/aishakhan',
  summary: 'Final-year computer science student who loves building fast, accessible web apps. Experienced with React and TypeScript through internships and personal projects.',
  experience: [{ title: 'Frontend Intern', org: 'Brightlabs Pvt Ltd', dates: 'May 2025 – Jul 2025', details: 'Built 6 reusable React components used across 3 products\nImproved page load time by 35% by lazy-loading images\nWrote unit tests that raised coverage from 40% to 75%' }],
  projects: [{ title: 'Campus Events App', org: 'React, Firebase', dates: '2024', details: 'Event discovery app used by 1,200+ students\nAdded push reminders that increased attendance by 20%' }],
  education: [{ title: 'B.Tech, Computer Science', org: 'ABC Institute of Technology · CGPA 8.6', dates: '2022 – 2026', details: '' }],
  skills: 'JavaScript, TypeScript, React, HTML, CSS, Git, Python, SQL, Figma', extra: 'Winner, college hackathon 2024\nVolunteer tutor for school students', accent: '#5f3fc4',
};
const empty = (): ResumeEntry => ({ title: '', org: '', dates: '', details: '' });
const ta = 'w-full rounded-xl border border-line bg-surface-2 p-3 text-sm text-fg focus:border-accent focus:outline-none';

function Entries({ label, list, onChange, titleLabel, orgLabel }: { label: string; list: ResumeEntry[]; onChange: (l: ResumeEntry[]) => void; titleLabel: string; orgLabel: string }) {
  const upd = (i: number, k: keyof ResumeEntry, v: string) => onChange(list.map((e, j) => (j === i ? { ...e, [k]: v } : e)));
  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-fg">{label}</h3>
      {list.map((e, i) => (
        <div key={i} className="relative space-y-2 rounded-xl border border-line p-3">
          <button type="button" onClick={() => onChange(list.filter((_, j) => j !== i))} className="absolute right-2 top-2 rounded p-1 text-fg-subtle hover:text-fg" aria-label={`Remove ${label} entry`}><X className="h-4 w-4" /></button>
          <div className="grid gap-2 sm:grid-cols-[1fr_1fr_150px]"><Input label={titleLabel} value={e.title} onChange={(x) => upd(i, 'title', x.target.value)} /><Input label={orgLabel} value={e.org} onChange={(x) => upd(i, 'org', x.target.value)} /><Input label="Dates" value={e.dates} onChange={(x) => upd(i, 'dates', x.target.value)} /></div>
          <label className="block"><span className="mb-1 block text-xs text-fg-subtle">Details (one bullet point per line)</span><textarea rows={3} className={ta} value={e.details} onChange={(x) => upd(i, 'details', x.target.value)} /></label>
        </div>
      ))}
      <Button variant="outline" size="sm" onClick={() => onChange([...list, empty()])} icon={<Plus className="h-4 w-4" aria-hidden />}>Add {label.toLowerCase().replace(/s$/, '')}</Button>
    </div>
  );
}

export default function ResumeBuilder() {
  const toast = useToast();
  const [r, setR] = useState<Resume>(() => readStorage<Resume>('resume', sample));
  const [busy, setBusy] = useState(false);
  useEffect(() => writeStorage('resume', r), [r]);
  const set = <K extends keyof Resume>(k: K, v: Resume[K]) => setR((x) => ({ ...x, [k]: v }));
  const dl = async () => { setBusy(true); try { downloadBlob(await resumePdf(r), `${(r.name || 'resume').replace(/[^\w ]+/g, '').trim().replace(/\s+/g, '-')}-Resume.pdf`); } catch { toast.error('The PDF could not be created.'); } finally { setBusy(false); } };
  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
      <Card className="space-y-6 p-4 sm:p-6">
        <div className="grid gap-3 sm:grid-cols-2">
          <Input label="Full name" value={r.name} onChange={(e) => set('name', e.target.value)} />
          <Input label="Headline" value={r.headline} onChange={(e) => set('headline', e.target.value)} placeholder="e.g. Marketing Graduate" />
          <Input label="Email" value={r.email} onChange={(e) => set('email', e.target.value)} />
          <Input label="Phone" value={r.phone} onChange={(e) => set('phone', e.target.value)} />
          <Input label="City, country" value={r.location} onChange={(e) => set('location', e.target.value)} />
          <Input label="LinkedIn / portfolio" value={r.link} onChange={(e) => set('link', e.target.value)} />
        </div>
        <label className="block"><span className="mb-1.5 block text-sm font-semibold text-fg">Summary</span><textarea rows={3} className={ta} value={r.summary} onChange={(e) => set('summary', e.target.value)} placeholder="2–3 lines about who you are and what you’re good at" /></label>
        <Entries label="Experience" list={r.experience} onChange={(l) => set('experience', l)} titleLabel="Job title" orgLabel="Company" />
        <Entries label="Projects" list={r.projects} onChange={(l) => set('projects', l)} titleLabel="Project name" orgLabel="Tools used" />
        <Entries label="Education" list={r.education} onChange={(l) => set('education', l)} titleLabel="Degree / class" orgLabel="School or college" />
        <label className="block"><span className="mb-1.5 block text-sm font-semibold text-fg">Skills (comma separated)</span><textarea rows={2} className={ta} value={r.skills} onChange={(e) => set('skills', e.target.value)} /></label>
        <label className="block"><span className="mb-1.5 block text-sm font-semibold text-fg">Achievements, certificates, languages (one per line)</span><textarea rows={3} className={ta} value={r.extra} onChange={(e) => set('extra', e.target.value)} /></label>
      </Card>
      <Card className="h-fit space-y-4 p-5 lg:sticky lg:top-24">
        <label className="flex items-center gap-3 text-sm font-medium text-fg">Accent colour <input type="color" value={r.accent} onChange={(e) => set('accent', e.target.value)} className="h-9 w-12 rounded-lg border border-line" /></label>
        <Button size="lg" className="w-full" onClick={dl} loading={busy} icon={<FileDown className="h-5 w-5" aria-hidden />}>Download resume PDF</Button>
        <Button variant="ghost" className="w-full" onClick={() => confirm('Clear everything and start fresh?') && setR({ ...sample, name: '', headline: '', email: '', phone: '', location: '', link: '', summary: '', experience: [empty()], projects: [], education: [empty()], skills: '', extra: '' })}>Start from blank</Button>
        <div className="rounded-xl bg-surface-2 p-3 text-xs leading-relaxed text-fg-muted"><strong className="text-fg">Tips:</strong> start bullets with action words (Built, Led, Improved), add numbers (“by 35%”), and keep it to one page if you have under 5 years of experience. The PDF uses a clean, ATS-friendly single-column layout.</div>
        <p className="text-xs text-fg-subtle">Saved on this device as you type. Nothing is uploaded.</p>
      </Card>
    </div>
  );
}
