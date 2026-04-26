"use client";

import Link from "next/link";

export default function Header() {
  return (
    <header className="w-full bg-slate-800 text-white p-4 flex justify-between items-center">
      <h1 className="font-bold text-lg">🌧️ Enchentes</h1>

      <nav className="flex gap-4">
        <Link href="/" className="hover:text-blue-400">Home</Link>
        <Link href="/dashboard" className="hover:text-blue-400">Desaparecidos</Link>
        <Link href="/voluntario/login" className="hover:text-green-400">Voluntário</Link>
        <Link href="/admin/login" className="hover:text-red-400">Admin</Link>
      </nav>
    </header>
  );
}