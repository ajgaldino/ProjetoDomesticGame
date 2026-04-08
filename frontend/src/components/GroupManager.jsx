import React, { useState } from 'react'
import { Home, UserPlus, ArrowRight, Loader2 } from 'lucide-react'
import { groupService } from '../services/api'

export function GroupManager({ onJoined }) {
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState(null) // 'create' or 'join'
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [error, setError] = useState(null)

  const handleCreate = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
        const res = await groupService.create(name)
        onJoined(res.data.id)
    } catch (err) {
        setError(err.response?.data?.detail || "Erro ao criar grupo")
    } finally {
        setLoading(false)
    }
  }

  const handleJoin = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
        await groupService.join(code)
        onJoined()
    } catch (err) {
        setError(err.response?.data?.detail || "Código inválido ou erro ao entrar")
    } finally {
        setLoading(false)
    }
  }

  if (!mode) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-6 text-center">
        <div className="w-20 h-20 bg-blue-500/10 rounded-full flex items-center justify-center mb-6">
          <Home className="text-blue-500" size={40} />
        </div>
        <h2 className="text-2xl font-bold mb-2 gradient-title">Sua Casa, Suas Regras</h2>
        <p className="text-slate-400 mb-8 max-w-xs small">Você ainda não faz parte de nenhuma casa. Comece criando uma ou entre em uma existente.</p>
        
        <div className="grid gap-4 w-full max-w-sm">
          <button 
            onClick={() => setMode('create')}
            className="flex items-center justify-between p-6 glass-card border-blue-500/20 hover:bg-blue-500/5 transition-all text-left"
          >
            <div>
              <p className="font-bold text-lg">Criar uma Casa</p>
              <p className="text-sm text-slate-500">Comece um novo grupo do zero</p>
            </div>
            <ArrowRight className="text-blue-500" />
          </button>

          <button 
            onClick={() => setMode('join')}
            className="flex items-center justify-between p-6 glass-card border-purple-500/20 hover:bg-purple-500/5 transition-all text-left"
          >
            <div>
              <p className="font-bold text-lg">Entrar em uma Casa</p>
              <p className="text-sm text-slate-500">Use um código de convite</p>
            </div>
            <ArrowRight className="text-purple-500" />
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 pt-12 animate-in fade-in zoom-in-95 duration-300">
        <button onClick={() => setMode(null)} className="text-slate-500 text-sm mb-6">← Voltar</button>
        
        <div className="glass-card p-8">
            <h2 className="text-2xl font-bold mb-6">
                {mode === 'create' ? 'Nomeie sua Residência' : 'Digite o Código'}
            </h2>

            {error && (
                <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                    {error}
                </div>
            )}

            <form onSubmit={mode === 'create' ? handleCreate : handleJoin} className="space-y-6">
                {mode === 'create' ? (
                    <div>
                        <label className="block text-sm text-slate-400 mb-2">Ex: Casa dos Amigos, Mansão Wayne...</label>
                        <input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            className="w-full p-4 bg-slate-900 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                            placeholder="Nome da Casa"
                            required
                        />
                    </div>
                ) : (
                    <div>
                        <input
                            type="text"
                            value={code}
                            onChange={(e) => setCode(e.target.value.toUpperCase())}
                            className="w-full p-4 bg-slate-900 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-purple-500 text-center text-2xl font-mono tracking-widest"
                            placeholder="CÓDIGO"
                            maxLength={6}
                            required
                        />
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 bg-blue-600 rounded-2xl font-bold flex items-center justify-center gap-2 hover:bg-blue-500 transition-all disabled:opacity-50"
                >
                    {loading ? <Loader2 className="animate-spin" /> : 'Confirmar'}
                </button>
            </form>
        </div>
    </div>
  )
}
