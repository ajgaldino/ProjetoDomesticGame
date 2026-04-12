import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { History, CheckCircle2, Clock, Zap } from 'lucide-react-native';
import { taskService } from '../../services/api';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function ActivitiesScreen() {
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchActivities = async () => {
    try {
      const res = await taskService.getMural();
      setActivities(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchActivities();
  }, []);

  const renderActivityItem = ({ item }: { item: any }) => {
    const timeAgo = formatDistanceToNow(new Date(item.timestamp), { 
      addSuffix: true, 
      locale: ptBR 
    });

    return (
      <View style={styles.activityCard}>
        <View style={styles.activityHeader}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>{item.profiles?.username?.[0]?.toUpperCase() || 'U'}</Text>
          </View>
          <View style={styles.headerText}>
            <Text style={styles.username}>
              <Text style={styles.bold}>{item.profiles?.username}</Text> concluiu:
            </Text>
            <Text style={styles.taskName}>{item.task_name}</Text>
          </View>
          <View style={styles.xpBadge}>
            <Zap size={10} color="#fbbf24" fill="#fbbf24" />
            <Text style={styles.xpText}>+{item.points_earned} XP</Text>
          </View>
        </View>

        {item.photo_url && (
            <View style={styles.imageContainer}>
                <Image source={{ uri: item.photo_url }} style={styles.image} resizeMode="cover" />
            </View>
        )}

        <View style={styles.activityFooter}>
          <Clock size={12} color="#475569" />
          <Text style={styles.timeText}>{timeAgo}</Text>
        </View>
      </View>
    );
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#3b82f6" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Atividades da Casa</Text>
        <Text style={styles.subtitle}>Veja o que está acontecendo no momento</Text>
      </View>

      <FlatList
        data={activities}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchActivities} tintColor="#3b82f6" />}
        contentContainerStyle={styles.list}
        renderItem={renderActivityItem}
        ListEmptyComponent={
          <View style={styles.empty}>
            <History size={48} color="#1e293b" />
            <Text style={styles.emptyText}>Nenhuma atividade registrada ainda. Vamos fazer as tarefas!</Text>
          </View>
        }
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
  header: {
    paddingTop: 60,
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: '#020617',
  },
  title: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 4,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  activityCard: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#1e293b',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
  },
  avatarText: {
    color: '#3b82f6',
    fontWeight: 'bold',
    fontSize: 16,
  },
  headerText: {
    flex: 1,
  },
  username: {
    color: '#94a3b8',
    fontSize: 14,
  },
  bold: {
    color: 'white',
    fontWeight: 'bold',
  },
  taskName: {
    color: 'white',
    fontSize: 15,
    fontWeight: '600',
    marginTop: 2,
  },
  xpBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  xpText: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: 'bold',
  },
  imageContainer: {
    marginTop: 12,
    borderRadius: 12,
    overflow: 'hidden',
    height: 150,
    width: '100%',
    backgroundColor: '#1e293b',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  activityFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 12,
  },
  timeText: {
    color: '#475569',
    fontSize: 12,
  },
  empty: {
    padding: 60,
    alignItems: 'center',
    gap: 16,
    marginTop: 40,
  },
  emptyText: {
    color: '#475569',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
});
