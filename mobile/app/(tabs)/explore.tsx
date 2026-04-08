import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { Trophy, Star } from 'lucide-react-native';
import { taskService } from '../../services/api';
import { LinearGradient } from 'expo-linear-gradient';

export default function RankingScreen() {
  const [loading, setLoading] = useState(true);
  const [ranking, setRanking] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRanking = async () => {
    try {
      const res = await taskService.getRanking();
      setRanking(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchRanking();
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
      <FlatList
        data={ranking}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchRanking} tintColor="#3b82f6" />}
        ListHeaderComponent={
          <View style={styles.header}>
            <Text style={styles.title}>Mural de Honra</Text>
            <Text style={styles.subtitle}>Os maiores especialistas da faxina</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={[styles.playerCard, index === 0 && styles.firstPlace]}>
            <View style={styles.rankInfo}>
              <View style={[styles.rankBadge, index === 0 ? styles.goldBadge : styles.normalBadge]}>
                <Text style={styles.rankText}>{index + 1}</Text>
              </View>
              <View>
                <Text style={styles.username}>{item.username} {index === 0 && <Trophy size={14} color="#f59e0b" />}</Text>
                <Text style={styles.titleText}>{item.title} • Lvl {item.level}</Text>
              </View>
            </View>
            <View style={styles.pointsInfo}>
              <Text style={styles.pointsText}>{item.total_points}</Text>
              <Text style={styles.xpLabel}>XP</Text>
            </View>
          </View>
        )}
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
  header: {
    padding: 24,
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: 'white',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 4,
  },
  listContent: {
    paddingBottom: 40,
  },
  playerCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginHorizontal: 24,
    marginBottom: 8,
    padding: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  firstPlace: {
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    borderColor: 'rgba(245, 158, 11, 0.1)',
  },
  rankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
  },
  rankBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  goldBadge: {
    backgroundColor: '#f59e0b',
  },
  normalBadge: {
    backgroundColor: 'rgba(255,255,255,0.05)',
  },
  rankText: {
    fontWeight: 'bold',
    color: 'white',
    fontSize: 14,
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  titleText: {
    color: '#64748b',
    fontSize: 12,
  },
  pointsInfo: {
    alignItems: 'flex-end',
  },
  pointsText: {
    color: '#3b82f6',
    fontWeight: 'bold',
    fontSize: 18,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  xpLabel: {
    color: '#334155',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
