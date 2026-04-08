import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, Alert, ActivityIndicator, RefreshControl, Clipboard, Platform } from 'react-native';
import { Users, Copy, Check, ShieldCheck, History, ThumbsUp, ThumbsDown, User } from 'lucide-react-native';
import { taskService, groupService } from '../../services/api';
import { supabase } from '../../lib/supabase';
import { LinearGradient } from 'expo-linear-gradient';

export default function HouseScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [history, setHistory] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [copied, setCopied] = useState(false);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase.from('profiles').select('*, groups(*)').eq('id', user.id).single();
      setProfile(profileData);

      if (profileData?.current_group_id) {
        const [pendingRes, historyRes] = await Promise.all([
          taskService.getPending(),
          taskService.getHistory()
        ]);
        setPendingTasks(pendingRes.data);
        setHistory(historyRes.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const copyToClipboard = () => {
    if (profile?.groups?.join_code) {
      Clipboard.setString(profile.groups.join_code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleVote = async (taskId: string, decision: string) => {
    try {
      await taskService.approve(taskId, decision);
      fetchData();
    } catch (err) {
      Alert.alert("Erro", "Não foi possível registrar seu voto.");
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <ScrollView 
        style={styles.container} 
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} tintColor="#3b82f6" />}
    >
      <View style={styles.header}>
        <Text style={styles.title}>Minha Casa</Text>
      </View>

      <View style={styles.padding}>
        {/* Group Info Card */}
        <LinearGradient colors={['rgba(255,255,255,0.05)', 'rgba(255,255,255,0.01)']} style={styles.card}>
            <View style={styles.houseIconBg}>
                <Users size={32} color="#3b82f6" />
            </View>
            <Text style={styles.houseName}>{profile?.groups?.name || 'Sua Casa'}</Text>
            <Text style={styles.codeLabel}>CÓDIGO DE CONVITE</Text>
            
            <TouchableOpacity style={styles.codeContainer} onPress={copyToClipboard}>
                <Text style={styles.codeText}>{profile?.groups?.join_code}</Text>
                {copied ? <Check size={20} color="#22c55e" /> : <Copy size={20} color="#64748b" />}
            </TouchableOpacity>
        </LinearGradient>

        {/* Approvals Section */}
        <Text style={styles.sectionTitle}>Votação Comunitária</Text>
        {pendingTasks.length > 0 ? pendingTasks.map((task) => (
            <View key={task.id} style={styles.approvalCard}>
                <View style={styles.approvalHeader}>
                    <View style={styles.approvalIcon}>
                        <ShieldCheck size={20} color="#f59e0b" />
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.approvalName}>{task.name}</Text>
                        <Text style={styles.approvalPoints}>+{task.points} XP sugeridos</Text>
                    </View>
                </View>
                <Text style={styles.approvalDesc}>{task.description || 'Sem detalhes.'}</Text>
                
                <View style={styles.voteRow}>
                    <TouchableOpacity 
                        style={[styles.voteBtn, styles.rejectBtn]} 
                        onPress={() => handleVote(task.id, 'reject')}
                        disabled={task.proposed_by === profile?.id}
                    >
                        <ThumbsDown size={18} color="#ef4444" />
                        <Text style={[styles.voteBtnText, { color: '#ef4444' }]}>Recusar</Text>
                    </TouchableOpacity>
                    <TouchableOpacity 
                        style={[styles.voteBtn, styles.approveBtn]} 
                        onPress={() => handleVote(task.id, 'approve')}
                        disabled={task.proposed_by === profile?.id}
                    >
                        <ThumbsUp size={18} color="#22c55e" />
                        <Text style={[styles.voteBtnText, { color: '#22c55e' }]}>Aprovar</Text>
                    </TouchableOpacity>
                </View>
                {task.proposed_by === profile?.id && (
                    <Text style={styles.mineText}>Aguardando voto dos outros moradores</Text>
                )}
            </View>
        )) : (
            <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Tudo em ordem. Nenhuma proposta pendente.</Text>
            </View>
        )}

        {/* History Section */}
        <Text style={styles.sectionTitle}>Linha do Tempo</Text>
        {history.length > 0 ? history.map((item) => (
            <View key={item.id} style={styles.historyCard}>
                <View style={styles.historyIcon}>
                   <Text style={{ fontSize: 20 }}>
                    {item.task_name.toLowerCase().includes('louça') ? '🍽️' : item.task_name.toLowerCase().includes('roupa') ? '👕' : '🧹'}
                   </Text>
                </View>
                <View style={{ flex: 1 }}>
                    <Text style={styles.historyName}>{item.task_name}</Text>
                    <View style={styles.historyMeta}>
                        <User size={10} color="#64748b" />
                        <Text style={styles.historyUser}>{item.profiles?.username}</Text>
                        <Text style={styles.historyDot}>•</Text>
                        <Text style={styles.historyDate}>{new Date(item.timestamp).toLocaleDateString()}</Text>
                    </View>
                </View>
                <Text style={styles.historyPoints}>+{item.points_earned}</Text>
            </View>
        )) : (
            <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>Ainda não há registros de atividades.</Text>
            </View>
        )}

      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#020617',
  },
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  padding: {
    padding: 24,
    paddingTop: 0,
    paddingBottom: 40,
  },
  card: {
    padding: 32,
    borderRadius: 32,
    alignItems: 'center',
    marginBottom: 32,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  houseIconBg: {
    width: 64,
    height: 64,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 32,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  houseName: {
    fontSize: 22,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 24,
  },
  codeLabel: {
    color: '#475569',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
    marginBottom: 8,
  },
  codeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: 'rgba(0,0,0,0.3)',
    width: '100%',
    padding: 20,
    borderRadius: 20,
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  codeText: {
    color: '#3b82f6',
    fontSize: 28,
    fontWeight: 'bold',
    letterSpacing: 4,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  sectionTitle: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  emptyCard: {
    padding: 24,
    backgroundColor: 'rgba(255,255,255,0.02)',
    borderRadius: 20,
    borderStyle: 'dashed',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 32,
  },
  emptyText: {
    color: '#475569',
    fontSize: 14,
    textAlign: 'center',
  },
  approvalCard: {
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    padding: 20,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.1)',
    marginBottom: 16,
  },
  approvalHeader: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
    marginBottom: 12,
  },
  approvalIcon: {
    width: 40,
    height: 40,
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  approvalName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  approvalPoints: {
    color: '#f59e0b',
    fontSize: 12,
  },
  approvalDesc: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 20,
  },
  voteRow: {
    flexDirection: 'row',
    gap: 12,
  },
  voteBtn: {
    flex: 1,
    height: 44,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  approveBtn: {
    backgroundColor: 'rgba(34, 197, 94, 0.1)',
  },
  rejectBtn: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
  },
  voteBtnText: {
    fontWeight: 'bold',
    fontSize: 12,
  },
  mineText: {
    color: '#475569',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
  historyCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.03)',
    padding: 16,
    borderRadius: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  historyIcon: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(0,0,0,0.2)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  historyName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  historyMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  historyUser: {
    color: '#64748b',
    fontSize: 10,
  },
  historyDot: {
    color: '#334155',
  },
  historyDate: {
    color: '#64748b',
    fontSize: 10,
  },
  historyPoints: {
    color: '#3b82f6',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
