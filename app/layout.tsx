import type { Metadata } from 'next';
import { ClerkProvider } from '@clerk/nextjs';
import '../styles/globals.css';

export const metadata: Metadata = {
  title: 'VOICYY - Voice-First Forms',
  description: 'Collect voice feedback like text.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className="bg-white text-gray-900">{children}</body>
      </html>
    </ClerkProvider>
  );
}