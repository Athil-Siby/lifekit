import {
  Cake, Calculator, CaseSensitive, FileDown, FileStack, FileText, Folder, Globe, HardDrive, Image, ImageDown, KeyRound,
  Percent, QrCode, Repeat, Ruler, Scissors, Sparkles, TextCursorInput, Type, type LucideIcon,
} from 'lucide-react';
import type { CategoryId, IconName } from '../config/tools';
import { cn } from '../lib/cn';

const icons: Record<IconName, LucideIcon> = {
  FileStack, Scissors, FileDown, ImageDown, Repeat, QrCode, KeyRound, Ruler, Type, Percent, Cake, Globe, CaseSensitive,
  HardDrive, FileText, Image, Sparkles, Calculator, TextCursorInput, Folder,
};

/** Subtle per-category tint so the directory is easy to scan. */
export const categoryTint: Record<CategoryId, string> = {
  pdf: 'bg-rose-50 text-rose-600 dark:bg-rose-500/10 dark:text-rose-300',
  image: 'bg-sky-50 text-sky-600 dark:bg-sky-500/10 dark:text-sky-300',
  generators: 'bg-violet-50 text-violet-600 dark:bg-violet-500/10 dark:text-violet-300',
  calculators: 'bg-emerald-50 text-emerald-600 dark:bg-emerald-500/10 dark:text-emerald-300',
  text: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
  files: 'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300',
};

export function ToolIcon({ name, category, size = 'md', className }: { name: IconName; category: CategoryId; size?: 'sm' | 'md' | 'lg'; className?: string }) {
  const Icon = icons[name];
  return (
    <span
      className={cn(
        'inline-flex shrink-0 items-center justify-center',
        size === 'sm' && 'h-8 w-8 rounded-lg',
        size === 'md' && 'h-11 w-11 rounded-xl',
        size === 'lg' && 'h-14 w-14 rounded-2xl',
        categoryTint[category],
        className,
      )}
      aria-hidden
    >
      <Icon className={size === 'sm' ? 'h-4 w-4' : size === 'md' ? 'h-5 w-5' : 'h-7 w-7'} />
    </span>
  );
}
