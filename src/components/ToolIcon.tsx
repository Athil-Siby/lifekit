import {
  AlarmClock, Cake, Calculator, CalendarDays, CaseSensitive, Clock, Coffee, FileDown, FileImage, FileStack, FileText, FileType,
  Folder, Globe, GraduationCap, HardDrive, HeartPulse, Image, ImageDown, Images, KeyRound, Landmark, Percent, Presentation,
  QrCode, Receipt, Repeat, RotateCw, Ruler, Scissors, Sparkles, Tag, TextCursorInput, Timer, Type, Volume2, Watch,
  Scaling, Crop, Minimize2, ScanText, Pipette, PenLine, ListOrdered, Stamp, AudioLines, StickyNote, ListTodo, GitCompare, Pilcrow, Keyboard, ChartPie, Dices, Barcode, Sigma, TrendingUp, PiggyBank, BadgePercent, School, Flame, Braces, Binary, Hash, Fingerprint, ScreenShare, Mic, Video, Code,
  type LucideIcon,
} from 'lucide-react';
import type { CategoryId, IconName } from '../config/tools';
import { cn } from '../lib/cn';

const icons: Record<IconName, LucideIcon> = {
  FileStack, Scissors, FileDown, ImageDown, Repeat, QrCode, KeyRound, Ruler, Type, Percent, Cake, Globe, CaseSensitive,
  HardDrive, FileText, Image, Sparkles, Calculator, TextCursorInput, Folder, Timer, Watch, AlarmClock, Coffee, Volume2, Tag,
  Receipt, HeartPulse, Landmark, GraduationCap, CalendarDays, FileImage, Images, FileType, Presentation, RotateCw, Clock,
  Scaling, Crop, Minimize2, ScanText, Pipette, PenLine, ListOrdered, Stamp, AudioLines, StickyNote, ListTodo, GitCompare, Pilcrow, Keyboard, ChartPie, Dices, Barcode, Sigma, TrendingUp, PiggyBank, BadgePercent, School, Flame, Braces, Binary, Hash, Fingerprint, ScreenShare, Mic, Video, Code,
};

/** One calm lavender tint for every tool (minimal look). */
export const categoryTint: Record<CategoryId, string> = {
  pdf: 'bg-accent-soft text-accent-text',
  image: 'bg-accent-soft text-accent-text',
  generators: 'bg-accent-soft text-accent-text',
  calculators: 'bg-accent-soft text-accent-text',
  time: 'bg-accent-soft text-accent-text',
  text: 'bg-accent-soft text-accent-text',
  media: 'bg-accent-soft text-accent-text',
  developer: 'bg-accent-soft text-accent-text',
  files: 'bg-accent-soft text-accent-text',
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
