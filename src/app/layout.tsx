import type { Metadata } from 'next';
import { Mitr } from 'next/font/google';
import { AppProviders } from '@/lib/providers';
import { DEFAULT_SITE_DESCRIPTION } from '@/lib/seo/constants';
import { getSiteConfig } from '@/lib/seo/metadata';
import './globals.css';

const mitr = Mitr({
  variable: '--font-mitr',
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  display: 'swap',
  preload: true,
});

export function buildRootMetadata(): Metadata {
  const { baseUrl, siteName } = getSiteConfig();
  const googleVerification = process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION;

  return {
    metadataBase: new URL(baseUrl),
    title: {
      template: `%s | ${siteName}`,
      default: siteName,
    },
    description: DEFAULT_SITE_DESCRIPTION,
    openGraph: {
      siteName,
      type: 'website',
      locale: 'th_TH',
    },
    ...(googleVerification ? { verification: { google: googleVerification } } : {}),
  };
}

export const metadata: Metadata = buildRootMetadata();

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${mitr.variable} ${mitr.className} h-full antialiased`}>
      <body className="flex min-h-dvh flex-col bg-sop-primary-100">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
