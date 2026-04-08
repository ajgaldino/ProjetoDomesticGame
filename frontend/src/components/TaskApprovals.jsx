import React from 'react'
import { motion } from 'framer-motion'
import { AlertCircle, ThumbsUp, ThumbsDown, User } from 'lucide-react'

export function TaskApprovals({ pendingTasks, currentUserId, onVote }) {
  if (!pendingTasks || pendingTasks.length === 0) {
    return (
      <div className="text-center py-10 glass rounded-3xl border-dashed border-white/10 opacity-50">
        <p className="text-slate-500 text-sm">Nenhuma proposta pendente.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {pendingTasks.map((task, index) => {
        const isMine = task.proposed_by === currentUserId

        return (
          <motion.div
            key={task.id}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: index * 0.1 }}
            className="glass bg-amber-500/5 border-amber-500/10 p-5 rounded-3xl"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center text-xl text-amber-500 shadow-inner">
                  🧪
                </div>
                <div>
                  <h3 className="font-bold text-slate-100">{task.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <AlertCircle size={12} className="text-amber-500" />
                    <span className="text-[10px] text-amber-500 font-bold uppercase tracking-wider">Pendente de Validação</span>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-amber-500 font-mono font-bold text-lg">+{task.points}</span>
                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter">PONTOS PROPOSTOS</p>
              </div>
            </div>

            <p className="text-sm text-slate-400 mb-6 px-1">
              {task.description || 'Sem descrição adicional.'}
            </p>

            <div className="flex items-center justify-between pt-4 border-t border-white/5">
                <div className="flex items-center gap-2 text-[10px] text-slate-500 italic">
                    <User size={12} /> Proposto por {isMine ? 'Você' : 'Outro Morador'}
                </div>

                <div className="flex gap-2">
                    {isMine ? (
                        <p className="text-[10px] text-slate-600 bg-white/5 px-3 py-1 rounded-full">Aguardando outros...</p>
                    ) : (
                        <>
                            <button
                                onClick={() => onVote(task.id, 'reject')}
                                className="p-2 px-4 rounded-xl bg-red-500/10 text-red-400 hover:bg-red-500 hover:text-white transition-all text-xs font-bold flex items-center gap-2"
                            >
                                <ThumbsDown size={14} /> Recusar
                            </button>
                            <button
                                onClick={() => onVote(task.id, 'approve')}
                                className="p-2 px-4 rounded-xl bg-green-500/10 text-green-400 hover:bg-green-500 hover:text-white transition-all text-xs font-bold flex items-center gap-2"
                            >
                                <ThumbsUp size={14} /> Aprovar
                            </button>
                        </>
                    )}
                </div>
            </div>
          </motion.div>
        )
      })}
    </div>
  )
}
