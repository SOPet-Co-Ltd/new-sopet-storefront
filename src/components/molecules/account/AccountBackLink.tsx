import Link from 'next/link';
import { ArrowLeftIcon } from '@/components/atoms/icons';

type AccountBackLinkProps = {
  href: string;
  label: string;
};

export function AccountBackLink({ href, label }: AccountBackLinkProps) {
  return (
    <Link
      href={href}
      className="inline-flex items-center gap-1.5 sop-body-sm-medium text-sop-secondary-500 transition-colors hover:text-sop-secondary-600"
    >
      <ArrowLeftIcon size={{ mobile: 16, desktop: 16 }} />
      {label}
    </Link>
  );
}
