import React, { useState } from 'react'
import { Plus, X, Loader2, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import api from '../services/api'

export function NewTaskModal({ isOpen, onClose, onCreated }) {
  const [name, setName] = useState('')
  const [points, setPoints] = useState(50)
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError(null)
    try {
      // Usaremos o endpoint de proposta de atualização ou um novo de proposta de tarefa
      // Para simplificar, enviaremos para uma rota que cria com status 'pending_approval'
      await api.post('/tasks/propose', { name, points, description })
      onCreated()
      handleClose()
    } catch (err) {
      setError(err.response?.data?.detail || "Erro ao propor tarefa")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setName('')
    setPoints(50)
    setDescription('')
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm" />
          
          <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }} className="w-full max-w-md glass bg-slate-900 border-white/10 rounded-3xl p-8 relative z-10">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold flex items-center gap-2">
                <Plus className="text-blue-500" /> Nova Proposta
              </h2>
              <button onClick={handleClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Nome da Tarefa</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full p-4 bg-slate-950 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ex: Lavar o Box"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Pontuação (XP)</label>
                <div className="flex items-center gap-4">
                    <input
                        type="range"
                        min="10"
                        max="200"
                        step="10"
                        value={points}
                        onChange={(e) => setPoints(parseInt(e.target.value))}
                        className="flex-1 accent-blue-500"
                    />
                    <span className="w-16 text-center font-mono font-bold text-blue-400 bg-blue-400/10 py-1 rounded-lg">{points}</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-widest mb-2">Descrição / Regras</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full h-24 p-4 bg-slate-950 border border-white/10 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 resize-none text-sm"
                  placeholder="Explique como a tarefa deve ser feita..."
                />
              </div>

              {error && <p className="text-red-400 text-xs">{error}</p>}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {loading ? <Loader2 className="animate-spin" /> : 'Enviar para Votação'}
                {!loading && <Star size={18} />}
              </button>
              <p className="text-[10px] text-center text-slate-600 uppercase tracking-widest">Sua tarefa só aparecerá após a aprovação de outro morador</p>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
