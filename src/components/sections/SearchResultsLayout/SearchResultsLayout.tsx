import { cn } from '@/lib/utils';
import { SearchFilterSidebar } from '@/components/molecules/SearchFilterSidebar';

type SearchResultsLayoutProps = {
  children: React.ReactNode;
  className?: string;
};

export function SearchResultsLayout({ children, className }: SearchResultsLayoutProps) {
  return (
    <div className={cn('flex w-full flex-col gap-5 lg:flex-row lg:items-start lg:gap-[21px]', className)}>
      <SearchFilterSidebar className="h-fit w-full shrink-0 lg:w-[305px]" />
      <section className="min-w-0 flex-1">{children}</section>
    </div>
  );
}
