import { Check, Copy } from 'lucide-react';
import { useCopy } from '../../hooks/useCopy';
import { Button, type ButtonSize, type ButtonVariant } from './Button';

export function CopyButton({
  text,
  label = 'Copy',
  variant = 'outline',
  size = 'sm',
  message,
  className,
}: {
  text: string;
  label?: string;
  variant?: ButtonVariant;
  size?: ButtonSize;
  message?: string;
  className?: string;
}) {
  const { copy, copied } = useCopy();
  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={() => copy(text, message)}
      disabled={!text}
      icon={copied ? <Check className="h-4 w-4 text-success" aria-hidden /> : <Copy className="h-4 w-4" aria-hidden />}
      aria-label={size === 'icon' ? label : undefined}
    >
      {size === 'icon' ? null : copied ? 'Copied' : label}
    </Button>
  );
}
