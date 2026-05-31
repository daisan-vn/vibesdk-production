import { Globe } from 'lucide-react';
import { useI18n, type Lang } from '@/contexts/i18n-context';
import { cn } from '@/lib/utils';

const OPTIONS: { value: Lang; label: string }[] = [
  { value: 'en', label: 'EN' },
  { value: 'vi', label: 'VI' },
];

/**
 * Compact EN | VI segmented switcher. `variant="icon"` collapses to a single
 * globe button that toggles between languages (for tight headers / mobile).
 */
export function LanguageSwitcher({
  variant = 'segmented',
  className,
}: {
  variant?: 'segmented' | 'icon';
  className?: string;
}) {
  const { lang, setLang, toggle } = useI18n();

  if (variant === 'icon') {
    return (
      <button
        type="button"
        onClick={toggle}
        aria-label={lang === 'en' ? 'Chuyển sang tiếng Việt' : 'Switch to English'}
        title={lang === 'en' ? 'Tiếng Việt' : 'English'}
        className={cn(
          'inline-flex items-center gap-1.5 rounded-lg border border-border-primary bg-bg-2/40 px-2.5 py-1.5 text-xs font-medium text-text-secondary transition-colors hover:text-text-primary',
          className,
        )}
      >
        <Globe className="size-4" />
        {lang.toUpperCase()}
      </button>
    );
  }

  return (
    <div
      className={cn(
        'inline-flex items-center rounded-lg border border-border-primary bg-bg-2/40 p-0.5',
        className,
      )}
      role="group"
      aria-label="Language / Ngôn ngữ"
    >
      <Globe className="ml-1.5 mr-0.5 size-3.5 text-text-tertiary" />
      {OPTIONS.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => setLang(opt.value)}
          aria-pressed={lang === opt.value}
          className={cn(
            'rounded-md px-2 py-1 text-xs font-medium transition-colors',
            lang === opt.value
              ? 'bg-accent text-white shadow-sm'
              : 'text-text-secondary hover:text-text-primary',
          )}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}
