'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'

export default function Home() {
  const [abrigos, setAbrigos] = useState([])
  const [stats, setStats] = useState({ total: 0, vagas: 0, ocupados: 0 })

  useEffect(() => {
    fetchAbrigos()
  }, [])

  const fetchAbrigos = async () => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/abrigos`)
      const data = await response.json()
      setAbrigos(data)

      const totalVagas = data.reduce((sum, a) => sum + a.capacidade_total, 0)
      const totalOcupados = data.reduce((sum, a) => sum + a.ocupados_atual, 0)

      setStats({
        total: data.length,
        vagas: totalVagas - totalOcupados,
        ocupados: totalOcupados,
      })
    } catch (error) {
      console.error('Erro ao carregar abrigos:', error)
    }
  }

  return (
    <div>
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-primary to-secondary text-white py-20">
        <div className="container mx-auto px-4">
          <h1 className="text-5xl font-bold mb-4">Mãos que Acolhem</h1>
          <p className="text-xl mb-8">Conectando ajuda a quem mais precisa</p>
          <div className="flex flex-wrap gap-4">
            <Link href="/voluntario/cadastro" className="bg-white text-primary px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition">
              Quero ser Voluntário
            </Link>
            <Link href="/admin/login" className="border-2 border-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-primary transition">
              Acesso Administrativo
            </Link>
            <Link
              href="/resgate"
              className="bg-red-600 text-white px-8 py-3 rounded-lg font-semibold hover:bg-red-700 transition animate-pulse"
            >
              🆘 Preciso de Resgate
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="container mx-auto px-4 -mt-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="card">
            <h3 className="text-gray-600 mb-2">Total de Abrigos</h3>
            <p className="text-4xl font-bold text-primary">{stats.total}</p>
          </div>
          <div className="card">
            <h3 className="text-gray-600 mb-2">Pessoas Abrigadas</h3>
            <p className="text-4xl font-bold text-warning">{stats.ocupados}</p>
          </div>
          <div className="card">
            <h3 className="text-gray-600 mb-2">Vagas Disponíveis</h3>
            <p className="text-4xl font-bold text-success">{stats.vagas}</p>
          </div>
        </div>
      </section>

      {/* Lista de Abrigos */}
      <section className="container mx-auto px-4 py-12">
        <h2 className="text-3xl font-bold mb-6">Abrigos Disponíveis</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {abrigos.map((abrigo) => (
            <div key={abrigo.id} className="card">
              <h3 className="text-xl font-bold mb-2">{abrigo.nome}</h3>
              <p className="text-gray-600 mb-3">{abrigo.endereco}</p>
              <div className="mb-3">
                <div className="flex justify-between text-sm mb-1">
                  <span>Ocupação</span>
                  <span className="font-semibold">{abrigo.ocupados_atual}/{abrigo.capacidade_total}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${(abrigo.ocupados_atual / abrigo.capacidade_total) * 100}%` }}
                  ></div>
                </div>
              </div>
              <p className="text-sm text-gray-600">
                📞 {abrigo.contato || 'Contato não informado'}
              </p>
            </div>
          ))}
        </div>
        {abrigos.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500">Carregando abrigos...</p>
          </div>
        )}
      </section>
    </div>
  )
}