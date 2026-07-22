import { Navbar } from './Navbar';

export function Header() {
  return (
    <header aria-label="Site header" className="sticky top-0 z-40 w-full backdrop-blur-md">
      <Navbar />
    </header>
  );
}
