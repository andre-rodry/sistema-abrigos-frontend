'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    const token = localStorage.getItem('token')
    setIsLoggedIn(!!token)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('userType')
    setIsLoggedIn(false)
    window.location.href = '/'
  }

  return (
    <header className="bg-white shadow-md sticky top-0 z-50">
      <nav className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold text-primary">
          Acolher+
        </Link>
        
        <div className="flex gap-6 items-center">
          <Link href="/" className="hover:text-primary transition">Início</Link>
          
          {isLoggedIn ? (
            <>
              {localStorage.getItem('userType') === 'admin' ? (
                <Link href="/admin/dashboard" className="hover:text-primary transition">Dashboard</Link>
              ) : (
                <Link href="/voluntario/painel" className="hover:text-primary transition">Meu Painel</Link>
              )}
              <button onClick={handleLogout} className="btn-danger px-4 py-2">Sair</button>
            </>
          ) : (
            <>
              <Link href="/voluntario/login" className="hover:text-primary transition">Voluntário</Link>
              <Link href="/admin/login" className="btn-primary">Admin</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}