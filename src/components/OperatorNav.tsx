'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { BarChart3, Database, FileUp, ListOrdered, PlusCircle, ArrowLeft } from 'lucide-react';

export default function OperatorNav() {
  const pathname = usePathname();

  const navLinks = [
    { href: '/operator', label: 'Overview', icon: BarChart3 },
    { href: '/operator/questions', label: 'Questions', icon: Database },
    { href: '/operator/questions/new', label: 'New Question', icon: PlusCircle },
    { href: '/operator/sessions', label: 'Sessions', icon: ListOrdered },
    { href: '/operator/import', label: 'Import Bank', icon: FileUp },
  ];

  return (
    <nav className="w-full bg-[#11131e] border-b border-[#24293e] px-6 py-3.5 flex items-center justify-between">
      <div className="flex items-center gap-6">
        <Link href="/operator" className="flex items-center gap-2 text-amber-400 font-display font-black text-lg">
          <span>50 MILLIONAIRE</span>
          <span className="text-white text-sm font-semibold tracking-wider uppercase">OPERATOR PORTAL</span>
        </Link>

        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  isActive
                    ? 'bg-amber-400 text-slate-950 font-bold'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{label}</span>
              </Link>
            );
          })}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <Link
          href="/"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/50 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-bold transition-all"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Stall Kiosk</span>
        </Link>
      </div>
    </nav>
  );
}
