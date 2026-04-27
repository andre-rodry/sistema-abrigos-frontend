'use client'

import { useState, useRef, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import { criarResgate, atualizarAudioResgate } from '../lib/api'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function uploadAudio(blob, resgateId) {
  const filename = `resgate_${resgateId}_${Date.now()}.webm`
  const { data, error } = await supabase.storage
    .from('audios')
    .upload(filename, blob, { contentType: 'audio/webm', upsert: false })

  if (error) throw error

  const { data: urlData } = supabase.storage
    .from('audios')
    .getPublicUrl(data.path)

  return urlData.publicUrl
}

export default function SolicitarResgate() {
  const [etapa, setEtapa] = useState('formulario')
  const [form, setForm] = useState({
    nome_solicitante: '',
    telefone: '',
    endereco_descricao: '',
    num_pessoas: 1,
    tem_crianca: false,
    tem_idoso: false,
    tem_deficiente: false,
    observacoes: '',
  })
  const [localizacao, setLocalizacao] = useState(null)
  const [statusGPS, setStatusGPS] = useState('pedindo')
  const [audioBlob, setAudioBlob] = useState(null)
  const [audioURL, setAudioURL] = useState(null)
  const [gravando, setGravando] = useState(false)
  const [tempoGravacao, setTempoGravacao] = useState(0)
  const [erro, setErro] = useState('')

  const mediaRecorderRef = useRef(null)
  const chunksRef = useRef([])
  const timerRef = useRef(null)

  useEffect(() => {
    if (!navigator.geolocation) {
      setStatusGPS('indisponivel')
      return
    }
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setLocalizacao({ latitude: pos.coords.latitude, longitude: pos.coords.longitude })
        setStatusGPS('obtida')
      },
      () => setStatusGPS('negada')
    )
  }, [])


  const iniciarGravacao = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      chunksRef.current = []

      const mimeType = MediaRecorder.isTypeSupported('audio/webm')
        ? 'audio/webm'
        : MediaRecorder.isTypeSupported('audio/mp4')
        ? 'audio/mp4'
        : 'audio/ogg'

      const recorder = new MediaRecorder(stream, { mimeType })
      mediaRecorderRef.current = recorder

      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data)
      }

      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: mimeType })
        setAudioBlob(blob)
        setAudioURL(URL.createObjectURL(blob))
        stream.getTracks().forEach((t) => t.stop())
      }

      recorder.start(100) 
      setGravando(true)
      setTempoGravacao(0)
      timerRef.current = setInterval(() => setTempoGravacao((t) => t + 1), 1000)
    } catch {
      alert('Não foi possível acessar o microfone. Verifique as permissões.')
    }
  }

  const pararGravacao = () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop()
      setGravando(false)
      clearInterval(timerRef.current)
    }
  }

  const descartarAudio = () => {
    setAudioBlob(null)
    setAudioURL(null)
    setTempoGravacao(0)
  }

  const formatarTempo = (s) =>
    `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`

  const emergenciaRapida = async () => {
    setErro('')
    setEtapa('enviando')
    try {
      await criarResgate({
        nome_solicitante: 'Emergência',
        latitude: localizacao?.latitude ?? null,
        longitude: localizacao?.longitude ?? null,
        num_pessoas: 1,
        observacoes: localizacao
          ? '🚨 EMERGÊNCIA RÁPIDA — com localização GPS'
          : '🚨 EMERGÊNCIA RÁPIDA — sem localização GPS',
      })
      setEtapa('sucesso')
    } catch {
      setErro('Erro ao enviar emergência. Tente novamente.')
      setEtapa('formulario')
    }
  }

  const enviarResgate = async () => {
    setErro('')

    const temGPS = !!localizacao
    const temEndereco = form.endereco_descricao.trim().length > 0
    const temAudio = !!audioBlob

  
    if (!temGPS && !temEndereco && !temAudio) {
      setErro('Informe pelo menos um: localização GPS, endereço ou áudio gravado.')
      return
    }

    setEtapa('enviando')
    try {
      const response = await criarResgate({
        ...form,
        latitude: localizacao?.latitude ?? null,
        longitude: localizacao?.longitude ?? null,
        tem_audio: temAudio,
      })

      
      const resgateId =
        response?.data?.id ??
        response?.data?.data?.id ??
        `anonimo_${Date.now()}`

      
      if (temAudio) {
        const audioPublicUrl = await uploadAudio(audioBlob, resgateId)
        // Só atualiza o banco se tiver um ID numérico real
        if (typeof resgateId === 'number' || !String(resgateId).startsWith('anonimo')) {
          await atualizarAudioResgate(resgateId, audioPublicUrl)
        }
      }

      setEtapa('sucesso')
    } catch (e) {
      console.error(e)
      setErro('Erro ao enviar solicitação. Tente novamente.')
      setEtapa('formulario')
    }
  }

  if (etapa === 'sucesso') {
    return (
      <div className="min-h-screen bg-green-50 flex items-center justify-center px-4">
        <div className="bg-white rounded-3xl shadow-lg p-8 max-w-sm w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-2xl font-bold text-green-700 mb-2">Solicitação Enviada!</h1>
          <p className="text-gray-600 mb-6">
            Um voluntário foi notificado e está a caminho. Aguarde em local seguro.
          </p>
          <p className="text-sm text-gray-400 mb-6">
            Se possível, mantenha seu telefone ligado para contato.
          </p>
          <button
            onClick={() => {
              setEtapa('formulario')
              setAudioBlob(null)
              setAudioURL(null)
            }}
            className="w-full bg-green-600 text-white py-3 rounded-xl font-semibold hover:bg-green-700 transition"
          >
            Nova Solicitação
          </button>
        </div>
      </div>
    )
  }

  if (etapa === 'enviando') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-5xl mb-4 animate-pulse">📡</div>
          <p className="text-lg font-semibold text-gray-700">Enviando solicitação...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-10">
      <div className="bg-white border-b px-4 py-4">
        <h1 className="text-xl font-bold text-gray-800">🆘 Solicitar Resgate</h1>
        <p className="text-sm text-gray-500">Preencha os dados para receber ajuda</p>
      </div>

      <div className="container mx-auto px-4 py-6 max-w-lg space-y-6">

        <button
          onClick={emergenciaRapida}
          className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white text-xl font-bold py-6 rounded-2xl shadow-lg transition flex flex-col items-center gap-1"
        >
          <span className="text-4xl">🚨</span>
          EMERGÊNCIA — PRECISO DE AJUDA AGORA
          <span className="text-sm font-normal opacity-80">
            {statusGPS === 'obtida'
              ? 'Vai enviar sua localização GPS'
              : 'Vai enviar sem localização GPS'}
          </span>
        </button>

        <div className="text-center text-gray-400 text-sm">— ou preencha os detalhes abaixo —</div>

        {erro && (
          <div className="bg-red-50 border border-red-300 text-red-700 rounded-xl px-4 py-3 text-sm">
            {erro}
          </div>
        )}

        {/* Localização */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-3">📍 Sua Localização</h2>
          {statusGPS === 'pedindo' && (
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3 text-blue-700 text-sm animate-pulse">
              📡 Obtendo sua localização automaticamente...
            </div>
          )}
          {statusGPS === 'obtida' && (
            <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-3 text-green-700 text-sm">
              ✅ Localização obtida com sucesso
            </div>
          )}
          {(statusGPS === 'negada' || statusGPS === 'indisponivel') && (
            <div className="bg-yellow-50 border border-yellow-300 rounded-xl px-4 py-3 text-yellow-800 text-sm">
              ⚠️ GPS não disponível — descreva o endereço abaixo ou grave um áudio.
            </div>
          )}
          <input
            className="mt-3 w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
            placeholder="Descreva o endereço (ex: Rua das Flores 123, próximo ao mercado)"
            value={form.endereco_descricao}
            onChange={(e) => setForm({ ...form, endereco_descricao: e.target.value })}
          />
        </div>

        {/* Dados pessoais */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 space-y-3">
          <h2 className="font-bold text-gray-700 mb-1">👤 Seus Dados (opcional)</h2>
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
            placeholder="Seu nome"
            value={form.nome_solicitante}
            onChange={(e) => setForm({ ...form, nome_solicitante: e.target.value })}
          />
          <input
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400"
            placeholder="Telefone para contato"
            type="tel"
            value={form.telefone}
            onChange={(e) => setForm({ ...form, telefone: e.target.value })}
          />
        </div>

        {/* Número de pessoas */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-3">👥 Pessoas que precisam de resgate</h2>
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => setForm({ ...form, num_pessoas: Math.max(1, form.num_pessoas - 1) })}
              className="w-10 h-10 bg-gray-100 rounded-full text-xl font-bold hover:bg-gray-200 transition"
            >−</button>
            <span className="text-3xl font-bold text-gray-800 w-10 text-center">{form.num_pessoas}</span>
            <button
              onClick={() => setForm({ ...form, num_pessoas: form.num_pessoas + 1 })}
              className="w-10 h-10 bg-gray-100 rounded-full text-xl font-bold hover:bg-gray-200 transition"
            >+</button>
            <span className="text-gray-500 text-sm">pessoa{form.num_pessoas > 1 ? 's' : ''}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {[
              { key: 'tem_crianca', label: '👶 Criança' },
              { key: 'tem_idoso', label: '👴 Idoso' },
              { key: 'tem_deficiente', label: '♿ Deficiente' },
            ].map(({ key, label }) => (
              <button
                key={key}
                onClick={() => setForm({ ...form, [key]: !form[key] })}
                className={`px-4 py-2 rounded-full text-sm font-semibold border-2 transition ${
                  form[key]
                    ? 'bg-red-100 border-red-400 text-red-700'
                    : 'bg-white border-gray-200 text-gray-500'
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>

        {/* Observações */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-3">📝 Observações</h2>
          <textarea
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-blue-400 resize-none"
            rows={3}
            placeholder="Descreva a situação (água na altura do joelho, pessoa acamada, animais...)"
            value={form.observacoes}
            onChange={(e) => setForm({ ...form, observacoes: e.target.value })}
          />
        </div>

        {/* Gravação de áudio */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
          <h2 className="font-bold text-gray-700 mb-1">🎙️ Enviar Áudio (opcional)</h2>
          <p className="text-xs text-gray-400 mb-4">
            Sem GPS e sem endereço? Grave um áudio descrevendo onde você está.
          </p>

          {!audioURL ? (
            <button
              onClick={gravando ? pararGravacao : iniciarGravacao}
              className={`w-full py-4 rounded-xl font-bold text-white transition active:scale-95 flex items-center justify-center gap-2 ${
                gravando ? 'bg-red-500 hover:bg-red-600 animate-pulse' : 'bg-gray-700 hover:bg-gray-800'
              }`}
            >
              {gravando ? (
                <>⏹ Parar gravação &nbsp;<span className="font-mono">{formatarTempo(tempoGravacao)}</span></>
              ) : (
                <>🎙️ Iniciar gravação</>
              )}
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-green-50 border border-green-200 rounded-xl px-4 py-2 text-green-700 text-sm">
                ✅ Áudio gravado — será enviado junto com a solicitação
              </div>
              {/* ✅ Player para ouvir antes de enviar */}
              <audio controls src={audioURL} className="w-full" preload="auto" />
              <button
                onClick={descartarAudio}
                className="w-full py-2 rounded-xl border border-red-300 text-red-600 text-sm font-semibold hover:bg-red-50 transition"
              >
                🗑️ Descartar áudio
              </button>
            </div>
          )}

          <div className="mt-4 bg-yellow-50 border border-yellow-300 rounded-xl px-4 py-3">
            <p className="text-yellow-800 font-semibold text-sm mb-2">⚠️ No áudio, tente informar:</p>
            <ul className="text-yellow-800 text-sm space-y-1">
              <li>📍 Endereço completo ou ponto de referência próximo</li>
              <li>👥 Quantas pessoas precisam de resgate</li>
              <li>👶 Se tem criança — quantas e qual idade</li>
              <li>👴 Se tem idoso</li>
              <li>🤰 Se tem mulher grávida</li>
              <li>♿ Se tem pessoa com deficiência ou acamada</li>
              <li>🐕 Se tem animal de estimação</li>
              <li>🌊 Como está a situação agora (nível da água, feridos, etc.)</li>
            </ul>
          </div>
        </div>

        <button
          onClick={enviarResgate}
          className="w-full bg-red-600 hover:bg-red-700 active:scale-95 text-white text-lg font-bold py-5 rounded-2xl shadow transition"
        >
          🆘 Enviar Solicitação de Resgate
        </button>

      </div>
    </div>
  )
}s