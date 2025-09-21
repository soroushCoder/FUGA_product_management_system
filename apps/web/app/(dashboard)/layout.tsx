import '../globals.css';
import type { Metadata, Viewport } from 'next';

export const metadata: Metadata = {
  title: 'FUGA Products',
  description: 'Minimal music product manager',
   icons: { icon: '/favicon.png' }
};

export const viewport: Viewport = { width: 'device-width', initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-gray-50 text-gray-900">{children}</body>
    </html>
  );
}
