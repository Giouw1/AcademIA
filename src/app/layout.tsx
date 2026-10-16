import type { Metadata } from 'next';
import './globals.css';
import Link from 'next/link';
import { Dumbbell, Activity, Calendar, Layers } from 'lucide-react';

export const metadata: Metadata = {
  title: 'Gym Assistant',
  description: 'Clean Architecture Personal Gym Assistant',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur sticky top-0 z-50">
          <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2.5 font-bold text-lg text-white">
              <span className="p-2 bg-blue-600 rounded-lg text-white">
                <Dumbbell className="w-5 h-5" />
              </span>
              <span>Gym Assistant</span>
            </Link>

            <nav className="flex items-center gap-1 sm:gap-2 text-sm font-medium">
              <Link
                href="/"
                className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
              >
                <Activity className="w-4 h-4" />
                <span className="hidden sm:inline">Dashboard</span>
              </Link>
              <Link
                href="/session"
                className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
              >
                <Dumbbell className="w-4 h-4" />
                <span>Workout</span>
              </Link>
              <Link
                href="/templates"
                className="px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition flex items-center gap-1.5"
              >
                <Layers className="w-4 h-4" />
                <span className="hidden sm:inline">Templates</span>
              </Link>
            </nav>
          </div>
        </header>

        <main className="flex-1 max-w-6xl w-full mx-auto px-4 py-8">{children}</main>

        <footer className="border-t border-slate-900 py-6 text-center text-xs text-slate-500">
          Gym Assistant &copy; 2026 &bull; Clean Architecture &bull; Domain-Driven Design
        </footer>
      </body>
    </html>
  );
}
