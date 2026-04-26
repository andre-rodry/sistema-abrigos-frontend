'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { loginVoluntario } from '@/app/lib/api'

export default function VoluntarioLogin() {
  const [credentials, setCredentials] = useState({ email: '', senha: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    
    try {
      const response = await loginVoluntario(credentials)
      localStorage.setItem('token', response.data.token)
      localStorage.setItem('user', JSON.stringify(response.data.user)) // ← CORREÇÃO
      router.push('/voluntario/painel')
    } catch (err) {
      setError('Email ou senha inválidos')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="text-center text-3xl font-bold text-gray-900">
            Acesso Voluntário
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Acompanhe suas atividades e contribuições
          </p>
        </div>
        
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
              {error}
            </div>
          )}
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">Email</label>
              <input
                type="email"
                required
                className="input-field mt-1"
                value={credentials.email}
                onChange={(e) => setCredentials({...credentials, email: e.target.value})}
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700">Senha</label>
              <input
                type="password"
                required
                className="input-field mt-1"
                value={credentials.senha}
                onChange={(e) => setCredentials({...credentials, senha: e.target.value})}
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-primary w-full disabled:opacity-50"
          >
            {loading ? 'Entrando...' : 'Entrar'}
          </button>
          
          <p className="text-center text-sm">
            Não tem cadastro?{' '}
            <a href="/voluntario/cadastro" className="text-primary hover:underline">
              Cadastre-se aqui
            </a>
          </p>
        </form>
      </div>
    </div>
  )
}