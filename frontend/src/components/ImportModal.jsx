import React, { useState } from 'react'
import { FileDown, X, Loader2, CheckCircle } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { taskService } from '../services/api'

export function ImportModal({ isOpen, onClose, onImported }) {
  const [jsonText, setJsonText] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)

  const handleImport = async () => {
    setLoading(true)
    setError(null)
    try {
      const parsed = JSON.parse(jsonText)
      if (!Array.isArray(parsed)) throw new Error("O JSON deve ser uma lista []")
      
      await taskService.importJSON(parsed)
      setSuccess(true)
      setTimeout(() => {
        onImported()
        handleClose()
      }, 1500)
    } catch (err) {
      setError(err.message || "Erro ao processar JSON. Verifique a sintaxe.")
    } finally {
      setLoading(false)
    }
  }

  const handleClose = () => {
    setJsonText('')
    setSuccess(false)
    setError(null)
    onClose()
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
          />
          
          <motion.div 
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-lg glass bg-slate-900 border-white/10 rounded-3xl p-8 relative z-10"
          >
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 rounded-lg text-blue-400">
                  <FileDown size={24} />
                </div>
                <h2 className="text-xl font-bold">Importar Tarefas</h2>
              </div>
              <button onClick={handleClose} className="p-2 hover:bg-white/5 rounded-full transition-colors">
                <X size={20} className="text-slate-500" />
              </button>
            </div>

            {success ? (
              <div className="py-12 flex flex-col items-center text-center">
                <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mb-4 text-green-500">
                  <CheckCircle size={40} />
                </div>
                <h3 className="text-xl font-bold">Tarefas Importadas!</h3>
                <p className="text-slate-400">Tudo pronto para começar a faxina.</p>
              </div>
            ) : (
              <div className="space-y-6">
                <p className="text-sm text-slate-400">Cole aqui um array JSON contendo as tarefas (name, description, points).</p>
                
                <textarea
                  value={jsonText}
                  onChange={(e) => setJsonText(e.target.value)}
                  className="w-full h-48 p-4 bg-slate-950 border border-white/10 rounded-2xl font-mono text-sm outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                  placeholder='[{"name": "Lavar Louça", "points": 50}, ...]'
                />

                {error && (
                  <p className="text-red-400 text-xs bg-red-400/10 p-3 rounded-xl">{error}</p>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={handleClose}
                    className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 rounded-2xl font-bold transition-all"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleImport}
                    disabled={loading || !jsonText}
                    className="flex-[2] py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {loading ? <Loader2 className="animate-spin" /> : 'Importar Agora'}
                  </button>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  )
}
