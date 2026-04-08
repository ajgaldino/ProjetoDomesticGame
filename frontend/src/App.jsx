import React, { useState, useEffect } from 'react'
import { CheckCircle2, Trophy, Users, History, Plus, LogOut, Loader2, AlertCircle, Bell, FileDown, ShieldCheck, Copy, Check } from 'lucide-react'
import { AnimatePresence, motion } from 'framer-motion'
import { supabase } from './lib/supabase'
import { Auth } from './components/Auth'
import { GroupManager } from './components/GroupManager'
import { ImportModal } from './components/ImportModal'
import { NewTaskModal } from './components/NewTaskModal'
import { HistoryLog } from './components/HistoryLog'
import { TaskApprovals } from './components/TaskApprovals'
import { taskService, groupService } from './services/api'

function App() {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState(null)
  const [tasks, setTasks] = useState([])
  const [pendingTasks, setPendingTasks] = useState([])
  const [ranking, setRanking] = useState([])
  const [history, setHistory] = useState([])
  const [error, setError] = useState(null)
  const [view, setView] = useState('tasks') 
  const [notification, setNotification] = useState(null)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false)
  const [isNewTaskModalOpen, setIsNewTaskModalOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
      else setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (session) fetchProfile(session.user.id)
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (profile?.current_group_id) fetchData()
  }, [profile?.current_group_id])

  // Realtime
  useEffect(() => {
    if (!profile?.current_group_id) return

    const taskChannel = supabase
      .channel('tasks-channel')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'completed_tasks', filter: `group_id=eq.${profile.current_group_id}` },
        (payload) => {
          if (payload.new && payload.new.user_id !== session.user.id) {
            showNotification(`Alguém concluiu uma tarefa! +${payload.new.points_earned} XP!`)
          }
          fetchData()
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'tasks', filter: `group_id=eq.${profile.current_group_id}` },
        () => fetchData()
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'profiles', filter: `id=eq.${session.user.id}` },
        (payload) => setProfile(prev => ({ ...prev, ...payload.new }))
      )
      .subscribe()

    return () => { supabase.removeChannel(taskChannel) }
  }, [profile?.current_group_id])

  const fetchProfile = async (userId) => {
    try {
      const { data, error } = await supabase.table('profiles').select('*, groups(*)').eq('id', userId).single()
      if (error) throw error
      setProfile(data)
    } catch (err) { console.error(err) } finally { setLoading(false) }
  }

  const fetchData = async () => {
    if (!profile?.current_group_id) return
    try {
      const [tasksRes, rankingRes, historyRes, pendingRes] = await Promise.all([
        taskService.getAll(),
        taskService.getRanking(),
        taskService.getHistory(),
        taskService.getPending()
      ])
      setTasks(tasksRes.data)
      setRanking(rankingRes.data)
      setHistory(historyRes.data)
      setPendingTasks(pendingRes.data)
    } catch (err) { setError("Erro ao conectar ao servidor.") }
  }

  const showNotification = (message) => {
    setNotification(message)
    setTimeout(() => setNotification(null), 5000)
  }

  const handleCompleteTask = async (taskId) => {
    try {
      await taskService.complete(taskId)
      fetchData()
      showNotification("Tarefa concluída! Mandou bem!")
    } catch (err) { alert("Erro ao concluir") }
  }

  const handleVote = async (taskId, decision) => {
    try {
      await taskService.approve(taskId, decision)
      fetchData()
      showNotification(decision === 'approve' ? "Tarefa aprovada!" : "Proposta recusada.")
    } catch (err) { alert("Erro ao registrar voto") }
  }

  const handleLogout = async () => {
    await supabase.auth.signOut()
    setProfile(null)
  }

  const copyCode = () => {
    if (profile.groups?.join_code) {
      navigator.clipboard.writeText(profile.groups.join_code)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center"><Loader2 className="animate-spin text-blue-500" size={40} /></div>
  if (!session) return <Auth onLogin={(user) => setSession({ user })} />
  if (!profile?.current_group_id) return (
    <div className="min-h-screen bg-slate-950 flex flex-col">
        <header className="p-6 flex justify-between items-center"><h1 className="text-2xl font-bold gradient-title">DomesticQuest</h1><button onClick={handleLogout} className="text-slate-500"><LogOut size={20}/></button></header>
    <GroupManager onJoined={() => fetchProfile(session.user.id)} /></div>
  )

  const currentLevelProgress = ((profile.total_points % 500) / 500) * 100

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      <AnimatePresence>{notification && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} className="fixed top-20 left-1/2 -translate-x-1/2 z-[150] w-[90%] max-w-sm">
          <div className="glass bg-blue-600/20 border-blue-500/30 p-4 rounded-2xl flex items-center gap-3 shadow-2xl backdrop-blur-xl">
            <Bell size={18} className="text-blue-400" /><p className="text-sm font-medium">{notification}</p>
          </div>
        </motion.div>
      )}</AnimatePresence>

      <ImportModal isOpen={isImportModalOpen} onClose={() => setIsImportModalOpen(false)} onImported={fetchData} />
      <NewTaskModal isOpen={isNewTaskModalOpen} onClose={() => setIsNewTaskModalOpen(false)} onCreated={fetchData} />

      <header className="fixed top-0 w-full z-50 glass border-b border-white/5 py-4 px-6 flex justify-between items-center backdrop-blur-md">
        <h1 className="text-2xl font-bold tracking-tight gradient-title">DomesticQuest</h1>
        <div className="flex gap-4 items-center">
          <div className="text-right"><p className="text-sm text-slate-400 font-bold uppercase tracking-tighter">LVL {profile.level}</p><p className="font-mono text-blue-400 font-bold">{profile.total_points % 500}/500</p></div>
          <button onClick={handleLogout} className="w-10 h-10 rounded-full bg-slate-900 border border-white/10 hover:bg-slate-800 flex items-center justify-center transition-colors"><LogOut size={18} className="text-slate-400" /></button>
        </div>
      </header>

      <main className="flex-1 pt-24 pb-20 px-4 max-w-2xl mx-auto w-full overflow-hidden">
        <AnimatePresence mode="wait">
          {view === 'tasks' && (
            <motion.div key="tasks" initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 10 }}>
              <div className="mb-8 p-6 glass bg-gradient-to-br from-blue-600/20 to-indigo-900/40 rounded-3xl border-white/5 relative overflow-hidden group">
                <div className="relative z-10">
                    <h2 className="text-2xl font-bold mb-1">E aí, {profile.username}!</h2>
                    <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-4">{profile.title}</p>
                    
                    <div className="space-y-1">
                        <div className="flex justify-between text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            <span>Próximo Nível</span>
                            <span>{Math.floor(currentLevelProgress)}%</span>
                        </div>
                        <div className="w-full h-2 bg-slate-950 rounded-full border border-white/5 overflow-hidden">
                            <motion.div initial={{ width: 0 }} animate={{ width: `${currentLevelProgress}%` }} className="h-full bg-gradient-to-r from-blue-500 to-indigo-500" />
                        </div>
                    </div>
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-5 group-hover:opacity-20 transition-opacity">
                    <Trophy size={120} />
                </div>
              </div>

              {pendingTasks.length > 0 && (
                <div onClick={() => setView('group')} className="mb-8 p-4 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-between cursor-pointer hover:bg-amber-500/20 transition-all group">
                    <div className="flex items-center gap-3">
                        <ShieldCheck className="text-amber-500 group-hover:scale-110 transition-transform" />
                        <p className="text-sm font-bold text-amber-500">{pendingTasks.length} {pendingTasks.length === 1 ? 'proposta pendente' : 'propostas pendentes'}</p>
                    </div>
                    <span className="text-xs text-amber-600 font-bold uppercase">Validar →</span>
                </div>
              )}

              <section className="mb-8">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-slate-400 uppercase text-xs font-semibold tracking-widest">Tarefas da Casa</h2>
                  <button onClick={() => setIsImportModalOpen(true)} className="flex items-center gap-2 text-blue-400 text-xs font-medium bg-blue-500/10 px-3 py-2 rounded-full hover:bg-blue-500/20 transition-all">
                    <FileDown size={14} /> Importar
                  </button>
                </div>
                <div className="space-y-4">
                  {tasks.length > 0 ? tasks.map(task => (
                    <div key={task.id} className="glass-card p-4 flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-2xl border border-white/5 shadow-inner">
                          {task.name.toLowerCase().includes('louça') ? '🍽️' : task.name.toLowerCase().includes('roupa') ? '👕' : '🧹'}
                        </div>
                        <div><h3 className="font-semibold">{task.name}</h3><p className="text-xs text-slate-500">+{task.points} XP</p></div>
                      </div>
                      <button onClick={() => handleCompleteTask(task.id)} className="p-3 rounded-2xl bg-blue-500/10 text-blue-400 border border-blue-500/20 hover:bg-blue-500 hover:text-white transition-all active:scale-95"><CheckCircle2 size={24} /></button>
                    </div>
                  )) : <div className="text-center py-12 glass rounded-3xl border-dashed border-white/10"><p className="text-slate-500 text-sm">Nenhuma tarefa ativa.</p></div>}
                </div>
              </section>
            </motion.div>
          )}

          {view === 'ranking' && (
            <motion.section key="ranking" initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -10 }} className="space-y-4">
              <h2 className="text-slate-400 uppercase text-xs font-semibold tracking-widest mb-4">Mural de Honra</h2>
              {ranking.map((p, i) => (
                <div key={p.id} className={`glass-card p-4 flex items-center justify-between ${i === 0 ? 'border-yellow-500/20 bg-yellow-500/5' : ''}`}>
                  <div className="flex items-center gap-4">
                    <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-sm ${i === 0 ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-500/20' : 'bg-slate-800 text-slate-400'}`}>{i + 1}</div>
                    <div><h3 className="font-semibold flex items-center gap-2">{p.username}{i === 0 && <Trophy size={14} className="text-yellow-500" />}</h3><p className="text-xs text-slate-500">{p.title} • Lvl {p.level}</p></div>
                  </div>
                  <p className="font-mono font-bold text-blue-400">{p.total_points} XP</p>
                </div>
              ))}
            </motion.section>
          )}

          {view === 'history' && (
            <motion.section key="history" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
              <h2 className="text-slate-400 uppercase text-xs font-semibold tracking-widest mb-4">Linha do Tempo</h2>
              <HistoryLog history={history} />
            </motion.section>
          )}

          {view === 'group' && (
            <motion.section key="group" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="space-y-6 pb-10">
                <div className="glass-card p-8 text-center bg-gradient-to-b from-blue-500/5 to-transparent relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="w-16 h-16 bg-blue-500/20 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-400 shadow-xl shadow-blue-500/10">
                            <Users size={32} />
                        </div>
                        <h2 className="text-2xl font-bold mb-1">{profile.groups?.name || 'Sua Casa'}</h2>
                        <p className="text-slate-500 text-sm mb-6">Membros: {ranking.length}</p>
                        
                        <div onClick={copyCode} className="bg-slate-950 p-6 rounded-2xl border border-white/5 font-mono text-3xl tracking-widest text-blue-400 relative group cursor-pointer active:scale-95 transition-all">
                            {profile.groups?.join_code}
                            <div className="absolute top-2 right-2 p-1 text-slate-600 group-hover:text-blue-500 transition-colors">
                                {copied ? <Check size={16} className="text-green-500" /> : <Copy size={16} />}
                            </div>
                            <div className="absolute inset-x-0 bottom-0 py-1 bg-blue-500/10 opacity-0 group-hover:opacity-100 text-[8px] font-bold uppercase tracking-[0.3em] transition-opacity">Clique para Copiar</div>
                        </div>
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-slate-400 uppercase text-xs font-semibold tracking-widest px-2">Validação Comunitária</h2>
                    <TaskApprovals pendingTasks={pendingTasks} currentUserId={session.user.id} onVote={handleVote} />
                </div>
            </motion.section>
          )}
        </AnimatePresence>
      </main>

      <nav className="fixed bottom-0 w-full glass border-t border-white/5 py-3 px-8 flex justify-between items-center max-w-full mx-auto md:max-w-2xl md:left-1/2 md:-translate-x-1/2 md:bottom-4 md:rounded-2xl z-50">
        <NavLink onClick={() => setView('tasks')} icon={<CheckCircle2 size={24} />} label="Fazer" active={view === 'tasks'} />
        <NavLink onClick={() => setView('ranking')} icon={<Trophy size={24} />} label="Ranking" active={view === 'ranking'} />
        <NavLink onClick={() => setIsNewTaskModalOpen(true)} icon={<Plus size={28} className="text-blue-400" />} label="Novo" />
        <NavLink onClick={() => setView('group')} icon={<Users size={24} />} label="Casa" active={view === 'group'} />
        <NavLink onClick={() => setView('history')} icon={<History size={24} />} label="Log" active={view === 'history'} />
      </nav>
    </div>
  )
}

function NavLink({ icon, label, active = false, onClick }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center gap-1 transition-all ${active ? 'text-blue-400 scale-110' : 'text-slate-500 hover:text-slate-300'}`}>
      {icon}<span className="text-[10px] font-medium">{label}</span>{active && <motion.div layoutId="nav-dot" className="w-1 h-1 bg-blue-400 rounded-full mt-1" />}
    </button>
  )
}

export default App
