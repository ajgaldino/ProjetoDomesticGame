import React from 'react'
import { motion } from 'framer-motion'
import { Calendar, User, Star } from 'lucide-react'

export function HistoryLog({ history }) {
  if (!history || history.length === 0) {
    return (
      <div className="text-center py-20 glass rounded-3xl border-dashed border-white/10">
        <p className="text-slate-500 text-sm">Nenhuma tarefa no histórico ainda.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6 pb-10">
      <div className="grid gap-4">
        {history.map((item, index) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.05 }}
            className="glass-card p-5 relative overflow-hidden group"
          >
            {/* Background Pattern */}
            <div className="absolute top-0 right-0 p-3 opacity-5 group-hover:opacity-10 transition-opacity">
                <Star size={80} />
            </div>

            <div className="flex items-start justify-between relative z-10">
              <div className="flex gap-4">
                <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-white/5 flex items-center justify-center text-xl shadow-inner">
                  {item.task_name.toLowerCase().includes('louça') ? '🍽️' : item.task_name.toLowerCase().includes('roupa') ? '👕' : '🧹'}
                </div>
                <div>
                  <h3 className="font-bold text-slate-100">{item.task_name}</h3>
                  <div className="flex items-center gap-3 mt-1">
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      <User size={12} className="text-blue-500" />
                      {item.profiles?.username || 'Usuário'}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                      <Calendar size={12} className="text-purple-500" />
                      {new Date(item.timestamp).toLocaleDateString()} {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <span className="text-blue-400 font-mono font-bold text-lg">+{item.points_earned}</span>
                <p className="text-[8px] text-slate-600 font-bold uppercase tracking-tighter">XP GANHO</p>
              </div>
            </div>

            {item.photo_url && (
              <div className="mt-4 rounded-xl overflow-hidden border border-white/5">
                <img 
                  src={item.photo_url} 
                  alt="Prova da tarefa" 
                  className="w-full h-48 object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
