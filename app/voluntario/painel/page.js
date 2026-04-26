'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { getResgates, aceitarResgate, concluirResgate } from '../../lib/api.js'

const STATUS_LABEL = {
  aguardando: { label: 'Aguardando', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  a_caminho: { label: 'A caminho', color: 'bg-blue-100 text-blue-800 border-blue-300' },
  concluido: { label: 'Concluído', color: 'bg-green-100 text-green-800 border-green-300' },
  cancelado: { label: 'Cancelado', color: 'bg-gray-100 text-gray-500 border-gray-300' },
}

export default function PainelVoluntario() {
  const router = useRouter()
  const [resgates, setResgates] = useState([])
  const [filtro, setFiltro] = useState('aguardando')
  const [carregando, setCarregando] = useState(true)
  const [acaoId, setAcaoId] = useState(null)
  const [voluntarioNome, setVoluntarioNome] = useState('')

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user') || '{}')
    if (!user?.tipo || user.tipo !== 'voluntario') {
      router.push('/voluntario/login')
      return
    }
    setVoluntarioNome(user.nome || 'Voluntário')
    carregarResgates()

    const interval = setInterval(carregarResgates, 30000)
    return () => clearInterval(interval)
  }, [filtro])

  const carregarResgates = useCallback(async () => {
    setCarregando(true)
    try {
      const { data } = await getResgates(filtro)
      setResgates(data)
    } catch {
      router.push('/voluntario/login')
    } finally {
      setCarregando(false)
    }
  }, [filtro])

  const handleAceitar = async (id) => {
    setAcaoId(id)
    try {
      await aceitarResgate(id)
      await carregarResgates()
    } catch (e) {
      alert(e?.response?.data?.error || 'Erro ao aceitar resgate')
    } finally {
      setAcaoId(null)
    }
  }

  const handleConcluir = async (id) => {
    if (!confirm('Confirmar que o resgate foi concluído?')) return
    setAcaoId(id)
    try {
      await concluirResgate(id)
      await carregarResgates()
    } catch (e) {
      alert(e?.response?.data?.error || 'Erro ao concluir resgate')
    } finally {
      setAcaoId(null)
    }
  }

  const abrirMapa = (lat, lng) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`, '_blank')
  }

  const sair = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    router.push('/voluntario/login')
  }

  const pendentes = resgates.filter((r) => r.status === 'aguardando').length

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b px-4 py-4 flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Painel do Voluntário</h1>
          <p className="text-sm text-gray-500">Olá, {voluntarioNome}</p>
        </div>
        <button onClick={sair} className="text-sm text-gray-500 hover:text-red-600 transition">
          Sair
        </button>
      </div>

      {/* Alerta de pendentes */}
      {pendentes > 0 && filtro !== 'aguardando' && (
        <div
          className="bg-red-600 text-white text-center py-3 px-4 font-semibold cursor-pointer"
          onClick={() => setFiltro('aguardando')}
        >
          🚨 {pendentes} solicitação{pendentes > 1 ? 'ões' : ''} aguardando resgate — Ver agora
        </div>
      )}

      <div className="container mx-auto px-4 py-6 max-w-2xl">
        {/* Filtros */}
        <div className="flex gap-2 mb-6 overflow-x-auto">
          {Object.entries(STATUS_LABEL).map(([key, { label }]) => (
            <button
              key={key}
              onClick={() => setFiltro(key)}
              className={`px-4 py-2 rounded-full text-sm font-semibold border transition whitespace-nowrap ${
                filtro === key
                  ? 'bg-primary text-white border-primary'
                  : 'bg-white text-gray-600 border-gray-300 hover:border-primary'
              }`}
            >
              {label}
              {key === 'aguardando' && pendentes > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs rounded-full px-2 py-0.5">
                  {pendentes}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Lista */}
        {carregando ? (
          <div className="text-center py-16 text-gray-400">Carregando...</div>
        ) : resgates.length === 0 ? (
          <div className="text-center py-16 text-gray-400">
            <p>Nenhuma solicitação com este status</p>
          </div>
        ) : (
          <div className="space-y-4">
            {resgates.map((r) => (
              <div
                key={r.id}
                className={`bg-white rounded-2xl border-2 p-5 shadow-sm ${
                  r.status === 'aguardando' ? 'border-red-300' : 'border-gray-200'
                }`}
              >
                {/* Cabeçalho do card */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <p className="font-bold text-gray-800 text-lg">
                      {r.nome_solicitante || 'Anônimo'}
                    </p>
                    {r.telefone && (
                      <a href={`tel:${r.telefone}`} className="text-blue-600 text-sm">
                        📞 {r.telefone}
                      </a>
                    )}
                  </div>
                  <span
                    className={`text-xs font-semibold px-3 py-1 rounded-full border ${STATUS_LABEL[r.status]?.color}`}
                  >
                    {STATUS_LABEL[r.status]?.label}
                  </span>
                </div>

                {/* Prioridades */}
                <div className="flex flex-wrap gap-2 mb-3">
                  <span className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                    👥 {r.num_pessoas} pessoa{r.num_pessoas > 1 ? 's' : ''}
                  </span>
                  {r.tem_crianca && (
                    <span className="bg-orange-100 text-orange-700 text-sm px-3 py-1 rounded-full">
                      👶 Criança
                    </span>
                  )}
                  {r.tem_idoso && (
                    <span className="bg-purple-100 text-purple-700 text-sm px-3 py-1 rounded-full">
                      👴 Idoso
                    </span>
                  )}
                  {r.tem_deficiente && (
                    <span className="bg-blue-100 text-blue-700 text-sm px-3 py-1 rounded-full">
                      ♿ Deficiente
                    </span>
                  )}
                </div>

                {/* Localização e observações */}
                {r.endereco_descricao && (
                  <p className="text-sm text-gray-600 mb-2">
                    📍 {r.endereco_descricao}
                  </p>
                )}
                {r.observacoes && (
                  <p className="text-sm text-gray-600 mb-3 italic">"{r.observacoes}"</p>
                )}

                {/* 🎙️ PLAYER DE ÁUDIO */}
                {r.audio_url && (
                  <div className="mb-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3">
                    <p className="text-xs text-orange-700 font-semibold mb-2">🎙️ Áudio da solicitação:</p>
                    <audio controls src={r.audio_url} className="w-full" />
                  </div>
                )}

                {r.status === 'a_caminho' && r.voluntario_nome && (
                  <p className="text-sm text-blue-600 mb-3">
                    🚗 Voluntário a caminho: <strong>{r.voluntario_nome}</strong>
                  </p>
                )}

                <p className="text-xs text-gray-400 mb-4">
                  Solicitado em {new Date(r.created_at).toLocaleString('pt-BR')}
                </p>

                {/* Ações */}
                <div className="flex gap-2 flex-wrap">
                  {r.latitude && r.longitude && (
                    <button
                      onClick={() => abrirMapa(r.latitude, r.longitude)}
                      className="flex-1 bg-blue-50 text-blue-700 border border-blue-200 py-3 rounded-xl text-sm font-semibold hover:bg-blue-100 transition"
                    >
                      🗺️ Ver no mapa
                    </button>
                  )}
                  {r.status === 'aguardando' && (
                    <button
                      onClick={() => handleAceitar(r.id)}
                      disabled={acaoId === r.id}
                      className="flex-1 bg-red-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-red-700 active:scale-95 transition disabled:opacity-50"
                    >
                      {acaoId === r.id ? 'Aceitando...' : '✅ Aceitar Resgate'}
                    </button>
                  )}
                  {r.status === 'a_caminho' && (
                    <button
                      onClick={() => handleConcluir(r.id)}
                      disabled={acaoId === r.id}
                      className="flex-1 bg-green-600 text-white py-3 rounded-xl text-sm font-bold hover:bg-green-700 active:scale-95 transition disabled:opacity-50"
                    >
                      {acaoId === r.id ? 'Salvando...' : '🏁 Marcar como Concluído'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Atualizar manualmente */}
        <button
          onClick={carregarResgates}
          className="mt-6 w-full text-center text-sm text-gray-400 hover:text-gray-600 py-3"
        >
          ↻ Atualizar lista
        </button>
      </div>
    </div>
  )
}