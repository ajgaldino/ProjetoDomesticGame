import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, ScrollView, FlatList, TouchableOpacity, ActivityIndicator, RefreshControl, Dimensions, Platform } from 'react-native';
import { CheckCircle2, Trophy, Bell, ShieldCheck, Plus } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { supabase } from '../../lib/supabase';
import { taskService } from '../../services/api';
import { GroupManagerMobile } from '@/components/GroupManagerMobile';

const { width } = Dimensions.get('window');

export default function HomeScreen() {
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: profileData } = await supabase.from('profiles').select('*, groups(*)').eq('id', user.id).single();
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
    
    // Suporte a Realtime (Incompleto aqui, mas o fluxo base funciona)
  }, []);

  const handleComplete = async (taskId: string) => {
    try {
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

            {pendingTasks.length > 0 && (
                <TouchableOpacity style={styles.pendingBanner}>
                    <ShieldCheck size={18} color="#f59e0b" />
                    <Text style={styles.pendingText}>{pendingTasks.length} propostas aguardando voto</Text>
                </TouchableOpacity>
            )}

            <Text style={styles.sectionTitle}>Tarefas da Casa</Text>
          </View>
        }
        renderItem={({ item }) => (
          <View style={styles.taskCard}>
            <View style={styles.taskIconBg}>
                <Text style={{ fontSize: 24 }}>
                    {item.name.toLowerCase().includes('louça') ? '🍽️' : item.name.toLowerCase().includes('roupa') ? '👕' : '🧹'}
                </Text>
            </View>
            <View style={styles.taskInfo}>
                <Text style={styles.taskName}>{item.name}</Text>
                <Text style={styles.taskPoints}>+{item.points} XP</Text>
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
    paddingBottom: 100,
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
    padding: 20,
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
  taskPoints: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: 'bold',
    marginTop: 2,
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
});
