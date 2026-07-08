type CardBrandLogoProps = {
  brand: string;
  className?: string;
};

function MastercardLogo() {
  return (
    <svg viewBox="0 0 32 20" className="h-5 w-8" aria-hidden>
      <circle cx="11" cy="10" r="8" fill="#EB001B" />
      <circle cx="21" cy="10" r="8" fill="#F79E1B" fillOpacity="0.95" />
    </svg>
  );
}

function VisaLogo() {
  return (
    <svg viewBox="0 0 32 20" className="h-5 w-8" aria-hidden>
      <rect width="32" height="20" rx="3" fill="#1A1F71" />
      <text
        x="16"
        y="13"
        textAnchor="middle"
        fill="#FFFFFF"
        fontSize="8"
        fontWeight="700"
        fontFamily="Arial, sans-serif"
      >
        VISA
      </text>
    </svg>
  );
}

export function CardBrandLogo({ brand, className }: CardBrandLogoProps) {
  const normalized = brand.trim().toLowerCase();

  return (
    <span className={className} data-testid={`card-brand-logo-${normalized || 'unknown'}`}>
      {normalized === 'mastercard' ? <MastercardLogo /> : null}
      {normalized === 'visa' ? <VisaLogo /> : null}
      {normalized !== 'mastercard' && normalized !== 'visa' ? (
        <span className="sop-body-xs-medium text-sop-neutral-gray-300">
          {brand || 'Card'}
        </span>
      ) : null}
    </span>
  );
}

export function formatCardBrandLabel(brand: string): string {
  const normalized = brand.trim().toLowerCase();
  if (!normalized) return 'Card';
  return normalized.charAt(0).toUpperCase() + normalized.slice(1);
}

export function formatSavedCardExpiry(month: number, year: number): string {
  const yy = year % 100;
  return `${String(month).padStart(2, '0')}/${String(yy).padStart(2, '0')}`;
}
