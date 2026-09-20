import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'THE GAUNTLET — High Stakes Arena',
  description: 'High-pressure 15-level arcade game-show arena. Survive the wheel, risk for greater glory, or cash out and walk away.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#090a0f] text-slate-100 min-h-screen overflow-hidden">
        {children}
      </body>
    </html>
  );
}
