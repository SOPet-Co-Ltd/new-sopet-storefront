import { Navbar } from './Navbar';

/**
 * Promo bar is h-10 (2.5rem). Nav row is ~3.8125rem on mobile (py-2 + 45px logo)
 * and ~4.3125rem on md+ (py-3 + 45px logo).
 */
const HEADER_SPACER_CLASS =
  'h-[calc(6.3125rem+env(safe-area-inset-top,0px))] shrink-0 md:h-[calc(6.8125rem+env(safe-area-inset-top,0px))]';

export function Header() {
  return (
    <>
      <header
        aria-label="Site header"
        className="fixed inset-x-0 top-0 z-40 w-full bg-sop-primary-100/95 pt-[env(safe-area-inset-top,0px)] backdrop-blur-md"
      >
        <Navbar />
      </header>
      <div className={HEADER_SPACER_CLASS} aria-hidden="true" />
    </>
  );
}
