import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'LiVid TV - Live Video, Reimagined',
  description: 'A private, peer-to-peer full-screen video calling application',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}

