import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions, Platform } from 'react-native';
import { CheckCircle2, Trophy, Bell, ShieldCheck, Plus, Sparkles, Flame, Zap } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { supabase } from '../../lib/supabase';
import { taskService } from '../../services/api';
import { GroupManagerMobile } from '@/components/GroupManagerMobile';
import { AddTaskModal } from '@/components/AddTaskModal';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const fetchData = async () => {
    console.log("DEBUG: Iniciando busca de dados (Profile/Tasks)...");
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('*, groups(*)')
        .eq('id', user.id);
      
      if (profileError) return;

      const profileData = profiles && profiles.length > 0 ? profiles[0] : null;
      setProfile(profileData);

      if (profileData?.current_group_id) {
        const [tasksRes, pendingRes] = await Promise.all([
          taskService.getAll(),
          taskService.getPending()
        ]);
        setTasks(tasksRes.data);
        setPendingTasks(pendingRes.data);
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

  const handleComplete = async (taskId: string) => {
    try {
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      await taskService.complete(taskId);
      fetchData();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  if (!profile?.current_group_id) {
    return (
        <ScrollView 
            contentContainerStyle={{ flexGrow: 1, backgroundColor: '#020617' }}
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} />}
        >
            <View style={styles.headerSpacer} />
            <GroupManagerMobile onJoined={fetchData} />
        </ScrollView>
    );
  }

  const currentLevelProgress = ((profile.total_points % 500) / 500) * 100;

  return (
    <View style={styles.container}>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} tintColor="#3b82f6" />}
        ListHeaderComponent={
          <View style={styles.padding}>
            <View style={styles.header}>
                <View>
                    <View style={styles.streakBadge}>
                      <Flame size={14} color="#f97316" fill="#f97316" />
                      <Text style={styles.streakText}>{profile.streak_count || 0} DIAS</Text>
                    </View>
                    <Text style={styles.greeting}>E aí, {profile.username}!</Text>
                    <Text style={styles.titleText}>{profile.title}</Text>
                </View>
                <TouchableOpacity style={styles.bellBtn}>
                    <Bell size={20} color="#94a3b8" />
                </TouchableOpacity>
            </View>

            <LinearGradient colors={['#2563eb', '#1e1b4b']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 1 }} style={styles.levelCard}>
                <View style={styles.levelRow}>
                    <Text style={styles.lvlText}>LVL {profile.level}</Text>
                    <Text style={styles.xpText}>{profile.total_points % 500}/500 XP</Text>
                </View>
                <View style={styles.progressBarBg}>
                    <View style={[styles.progressBarFill, { width: `${currentLevelProgress}%` }]} />
                </View>
                <Trophy size={80} color="rgba(255,255,255,0.05)" style={styles.trophyIcon} />
            </LinearGradient>

            <View style={styles.statsGrid}>
                <View style={styles.statBox}>
                    <Text style={styles.statTitle}>🧹 LIMPEZA</Text>
                    <Text style={styles.statValue}>{profile.exp_cleaning || 0}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statTitle}>👕 ORG.</Text>
                    <Text style={styles.statValue}>{profile.exp_org || 0}</Text>
                </View>
                <View style={styles.statBox}>
                    <Text style={styles.statTitle}>🍳 COZINHA</Text>
                    <Text style={styles.statValue}>{profile.exp_cooking || 0}</Text>
                </View>
            </View>

            {pendingTasks.length > 0 && (
                <TouchableOpacity style={styles.pendingBanner}>
                    <ShieldCheck size={18} color="#f59e0b" />
                    <Text style={styles.pendingText}>{pendingTasks.length} propostas aguardando voto</Text>
                </TouchableOpacity>
            )}

            <Text style={styles.sectionTitle}>Tarefas do Grupo</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <View style={styles.taskIconBg}>
                <Text style={{ fontSize: 24 }}>
                    {item.category === 'cleaning' ? '🧹' : item.category === 'organization' ? '👕' : item.category === 'cooking' ? '🍳' : '✨'}
                </Text>
            </View>
            <View style={styles.taskInfo}>
                <Text style={styles.taskName}>{item.name}</Text>
                <View style={styles.taskMeta}>
                  <Text style={styles.taskPoints}>+{item.points} XP</Text>
                  <Text style={[styles.categoryTag, { color: item.category === 'cleaning' ? '#22c55e' : item.category === 'organization' ? '#a855f7' : '#ef4444' }]}>
                    • {item.category?.toUpperCase() || 'GERAL'}
                  </Text>
                </View>
            </View>
            <TouchableOpacity onPress={() => handleComplete(item.id)} style={styles.completeBtn}>
                <CheckCircle2 size={24} color="#3b82f6" />
            </TouchableOpacity>
          </View>
        )}
        ListEmptyComponent={
            <View style={styles.empty}>
                <Text style={styles.emptyText}>Nenhuma tarefa ativa. Use o botão "+" abaixo para propor uma!</Text>
            </View>
        }
        contentContainerStyle={styles.listContent}
      />

      {/* Botão Flutuante (FAB) */}
      <TouchableOpacity 
        style={styles.fab} 
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          setModalVisible(true);
        }}
      >
        <Plus color="white" size={32} />
      </TouchableOpacity>

      <AddTaskModal 
        visible={modalVisible} 
        groupId={profile.current_group_id}
        onClose={() => setModalVisible(false)}
        onSuccess={() => {
          Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          fetchData();
        }}
      />
    </View>
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
  padding: {
    padding: 24,
  },
  listContent: {
    paddingBottom: 120,
  },
  headerSpacer: {
    height: 60,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 40,
    marginBottom: 24,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(249, 115, 22, 0.1)',
    alignSelf: 'flex-start',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginBottom: 8,
    gap: 4,
  },
  streakText: {
    color: '#f97316',
    fontSize: 10,
    fontWeight: '900',
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
  },
  titleText: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 2,
    marginTop: 4,
  },
  bellBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.05)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  levelCard: {
    padding: 24,
    borderRadius: 24,
    overflow: 'hidden',
    marginBottom: 24,
  },
  levelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
    marginBottom: 12,
  },
  lvlText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  xpText: {
    color: 'rgba(255,255,255,0.6)',
    fontSize: 12,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  progressBarBg: {
    height: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#3b82f6',
  },
  trophyIcon: {
    position: 'absolute',
    right: -10,
    bottom: -10,
  },
  statsGrid: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  statTitle: {
    color: '#64748b',
    fontSize: 8,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statValue: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  pendingBanner: {
    backgroundColor: 'rgba(245, 158, 11, 0.1)',
    padding: 12,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  pendingText: {
    color: '#f59e0b',
    fontSize: 12,
    fontWeight: 'bold',
  },
  sectionTitle: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
    marginBottom: 16,
  },
  taskCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginHorizontal: 24,
    marginBottom: 12,
    padding: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  taskIconBg: {
    width: 52,
    height: 52,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  taskInfo: {
    flex: 1,
    marginLeft: 16,
  },
  taskName: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 2,
  },
  taskPoints: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryTag: {
    fontSize: 9,
    fontWeight: '800',
  },
  completeBtn: {
    width: 44,
    height: 44,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  empty: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: '#475569',
    textAlign: 'center',
    fontSize: 14,
  },
  fab: {
    position: 'absolute',
    right: 24,
    bottom: Platform.OS === 'ios' ? 100 : 24,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#3b82f6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
  },
});
