'use client'

import { useState, useEffect } from 'react'
import { getAbrigos, createAbrigo, updateAbrigo, deleteAbrigo } from '@/app/lib/api'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell } from 'recharts'

export default function AdminDashboard() {
  const [abrigos, setAbrigos] = useState([])
  const [showModal, setShowModal] = useState(false)
  const [editingAbrigo, setEditingAbrigo] = useState(null)
  const [formData, setFormData] = useState({
    nome: '', endereco: '', latitude: '', longitude: '',
    capacidade_total: '', ocupados_atual: '', contato: ''
  })

  useEffect(() => {
    loadAbrigos()
  }, [])

  const loadAbrigos = async () => {
    const response = await getAbrigos()
    setAbrigos(response.data)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const data = {
      ...formData,
      latitude: parseFloat(formData.latitude),
      longitude: parseFloat(formData.longitude),
      capacidade_total: parseInt(formData.capacidade_total),
      ocupados_atual: parseInt(formData.ocupados_atual)
    }
    
    if (editingAbrigo) {
      await updateAbrigo(editingAbrigo.id, data)
    } else {
      await createAbrigo(data)
    }
    
    loadAbrigos()
    setShowModal(false)
    resetForm()
  }

  const handleDelete = async (id) => {
    if (confirm('Tem certeza que deseja excluir este abrigo?')) {
      await deleteAbrigo(id)
      loadAbrigos()
    }
  }

  const resetForm = () => {
    setFormData({
      nome: '', endereco: '', latitude: '', longitude: '',
      capacidade_total: '', ocupados_atual: '', contato: ''
    })
    setEditingAbrigo(null)
  }

  const stats = {
    totalVagas: abrigos.reduce((sum, a) => sum + a.capacidade_total, 0),
    totalOcupados: abrigos.reduce((sum, a) => sum + a.ocupados_atual, 0),
    ocupacaoPercentual: (abrigos.reduce((sum, a) => sum + a.ocupados_atual, 0) / 
                         abrigos.reduce((sum, a) => sum + a.capacidade_total, 0) * 100).toFixed(1)
  }

  const pieData = [
    { name: 'Ocupados', value: stats.totalOcupados },
    { name: 'Vagos', value: stats.totalVagas - stats.totalOcupados }
  ]

  const COLORS = ['#D97706', '#059669']

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Dashboard Administrativo</h1>
        <button onClick={() => setShowModal(true)} className="btn-primary">
          + Novo Abrigo
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="card">
          <h3 className="text-gray-600">Capacidade Total</h3>
          <p className="text-3xl font-bold text-primary">{stats.totalVagas}</p>
        </div>
        <div className="card">
          <h3 className="text-gray-600">Pessoas Abrigadas</h3>
          <p className="text-3xl font-bold text-warning">{stats.totalOcupados}</p>
        </div>
        <div className="card">
          <h3 className="text-gray-600">Taxa de Ocupação</h3>
          <p className="text-3xl font-bold text-success">{stats.ocupacaoPercentual}%</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Ocupação por Abrigo</h3>
          <BarChart width={500} height={300} data={abrigos}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="nome" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="ocupados_atual" fill="#D97706" name="Ocupados" />
            <Bar dataKey="capacidade_total" fill="#0891B2" name="Capacidade" />
          </BarChart>
        </div>
        
        <div className="card">
          <h3 className="text-xl font-semibold mb-4">Visão Geral</h3>
          <PieChart width={400} height={300}>
            <Pie
              data={pieData}
              cx={200}
              cy={150}
              innerRadius={60}
              outerRadius={100}
              fill="#8884d8"
              paddingAngle={5}
              dataKey="value"
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>
      </div>

      {/* Tabela de Abrigos */}
      <div className="card">
        <h3 className="text-xl font-semibold mb-4">Lista de Abrigos</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Nome</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Endereço</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ocupação</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {abrigos.map((abrigo) => (
                <tr key={abrigo.id}>
                  <td className="px-6 py-4">{abrigo.nome}</td>
                  <td className="px-6 py-4">{abrigo.endereco}</td>
                  <td className="px-6 py-4">
                    {abrigo.ocupados_atual}/{abrigo.capacidade_total}
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div 
                        className="bg-primary h-2 rounded-full"
                        style={{width: `${(abrigo.ocupados_atual/abrigo.capacidade_total)*100}%`}}
                      ></div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <button 
                      onClick={() => {
                        setEditingAbrigo(abrigo)
                        setFormData(abrigo)
                        setShowModal(true)
                      }}
                      className="text-blue-600 hover:text-blue-800 mr-3"
                    >
                      Editar
                    </button>
                    <button 
                      onClick={() => handleDelete(abrigo.id)}
                      className="text-red-600 hover:text-red-800"
                    >
                      Excluir
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-4">
              {editingAbrigo ? 'Editar Abrigo' : 'Novo Abrigo'}
            </h2>
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Nome</label>
                  <input
                    required
                    className="input-field"
                    value={formData.nome}
                    onChange={(e) => setFormData({...formData, nome: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Endereço</label>
                  <input
                    required
                    className="input-field"
                    value={formData.endereco}
                    onChange={(e) => setFormData({...formData, endereco: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Latitude</label>
                  <input
                    required
                    type="number"
                    step="any"
                    className="input-field"
                    value={formData.latitude}
                    onChange={(e) => setFormData({...formData, latitude: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Longitude</label>
                  <input
                    required
                    type="number"
                    step="any"
                    className="input-field"
                    value={formData.longitude}
                    onChange={(e) => setFormData({...formData, longitude: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Capacidade Total</label>
                  <input
                    required
                    type="number"
                    className="input-field"
                    value={formData.capacidade_total}
                    onChange={(e) => setFormData({...formData, capacidade_total: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Ocupados Atual</label>
                  <input
                    required
                    type="number"
                    className="input-field"
                    value={formData.ocupados_atual}
                    onChange={(e) => setFormData({...formData, ocupados_atual: e.target.value})}
                  />
                </div>
                <div className="col-span-2">
                  <label className="block text-sm font-medium mb-1">Contato</label>
                  <input
                    className="input-field"
                    value={formData.contato}
                    onChange={(e) => setFormData({...formData, contato: e.target.value})}
                  />
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button type="submit" className="btn-primary flex-1">
                  {editingAbrigo ? 'Atualizar' : 'Cadastrar'}
                </button>
                <button 
                  type="button" 
                  onClick={() => {
                    setShowModal(false)
                    resetForm()
                  }}
                  className="btn-danger flex-1"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}