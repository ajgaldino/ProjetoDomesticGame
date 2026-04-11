import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, Image, ActivityIndicator, RefreshControl } from 'react-native';
import { Camera, Heart, MessageCircle } from 'lucide-react-native';
import { taskService } from '../../services/api';

export default function MuralScreen() {
  const [loading, setLoading] = useState(true);
  const [photos, setPhotos] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchMural = async () => {
    try {
      const res = await taskService.getMural();
      setPhotos(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchMural();
  }, []);

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
        <Text style={styles.title}>Mural Social</Text>
        <Text style={styles.subtitle}>Veja quem está mandando bem na casa!</Text>
      </View>

      <FlatList
        data={photos}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchMural} tintColor="#3b82f6" />}
        contentContainerStyle={styles.list}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.avatar}>
                <Text style={styles.avatarText}>{item.profiles?.username?.[0]?.toUpperCase() || 'U'}</Text>
              </View>
              <View>
                <Text style={styles.username}>{item.profiles?.username}</Text>
                <Text style={styles.taskName}>{item.task_name}</Text>
              </View>
            </View>
            
            <Image source={{ uri: item.photo_url }} style={styles.image} resizeMode="cover" />
            
            <View style={styles.cardFooter}>
                <View style={styles.actions}>
                    <Heart size={20} color="#ef4444" fill="#ef4444" />
                    <MessageCircle size={20} color="#94a3b8" />
                </View>
                <Text style={styles.points}>+{item.points_earned} XP acumulados</Text>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Camera size={48} color="#1e293b" />
            <Text style={styles.emptyText}>Nenhuma foto no mural ainda. Complete uma tarefa com foto para aparecer aqui!</Text>
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
  card: {
    backgroundColor: '#0f172a',
    borderRadius: 20,
    marginBottom: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    gap: 12,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#3b82f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
  },
  taskName: {
    color: '#94a3b8',
    fontSize: 12,
  },
  image: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: '#1e293b',
  },
  cardFooter: {
    padding: 16,
  },
  actions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 8,
  },
  points: {
    color: '#3b82f6',
    fontSize: 12,
    fontWeight: '600',
  },
  empty: {
    padding: 60,
    alignItems: 'center',
    gap: 16,
  },
  emptyText: {
    color: '#475569',
    textAlign: 'center',
    fontSize: 14,
    lineHeight: 20,
  },
});
