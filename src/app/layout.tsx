import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: '50 MILLIONAIRE — High Stakes Arena',
  description: '50 Millionaire: High-pressure 15-level arcade game-show arena. Spin the color wheel, solve the aptitude challenge, and rise from 10 to 150 Points!',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased bg-[#090a0f] text-slate-100 min-h-screen">
        {children}
      </body>
    </html>
  );
}
