'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { registerVoluntario } from '@/app/lib/api'

export default function CadastroVoluntario() {
  const [formData, setFormData] = useState({
    nome: '', email: '', telefone: '', cidade: '',
    disponibilidade: '', habilidades: '', senha: ''
  })
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    
    try {
      await registerVoluntario(formData)
      setSuccess(true)
      setTimeout(() => router.push('/voluntario/login'), 2000)
    } catch (error) {
      alert('Erro ao cadastrar. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="card text-center max-w-md">
          <div className="text-success text-6xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-2">Cadastro Realizado!</h2>
          <p className="text-gray-600">Redirecionando para o login...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-2xl">
      <div className="card">
        <h1 className="text-3xl font-bold mb-2">Cadastro de Voluntário</h1>
        <p className="text-gray-600 mb-6">Junte-se a nós e ajude quem precisa</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome Completo *</label>
              <input
                required
                className="input-field"
                value={formData.nome}
                onChange={(e) => setFormData({...formData, nome: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input
                required
                type="email"
                className="input-field"
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Telefone *</label>
              <input
                required
                className="input-field"
                value={formData.telefone}
                onChange={(e) => setFormData({...formData, telefone: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Cidade *</label>
              <input
                required
                className="input-field"
                value={formData.cidade}
                onChange={(e) => setFormData({...formData, cidade: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Disponibilidade</label>
              <select
                className="input-field"
                value={formData.disponibilidade}
                onChange={(e) => setFormData({...formData, disponibilidade: e.target.value})}
              >
                <option value="">Selecione</option>
                <option value="integral">Integral (Manhã/Tarde/Noite)</option>
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
                <option value="fim_semana">Fim de semana</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">Habilidades</label>
              <select
                className="input-field"
                value={formData.habilidades}
                onChange={(e) => setFormData({...formData, habilidades: e.target.value})}
              >
                <option value="">Selecione</option>
                <option value="enfermagem">Enfermagem/Saúde</option>
                <option value="logistica">Logística</option>
                <option value="cozinha">Cozinha</option>
                <option value="limpeza">Limpeza</option>
                <option value="administracao">Administração</option>
                <option value="geral">Geral</option>
              </select>
            </div>
            
            <div className="md:col-span-2">
              <label className="block text-sm font-medium mb-1">Senha *</label>
              <input
                required
                type="password"
                className="input-field"
                value={formData.senha}
                onChange={(e) => setFormData({...formData, senha: e.target.value})}
              />
            </div>
          </div>
          
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Cadastrando...' : 'Cadastrar'}
          </button>
        </form>
      </div>
    </div>
  )
}