import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, ActivityIndicator, RefreshControl, Platform } from 'react-native';
import { Trophy, Star, Shield, Zap, Flame } from 'lucide-react-native';
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
            <Text style={styles.subtitle}>Os maiores especialistas da casa</Text>
          </View>
        }
        renderItem={({ item, index }) => (
          <View style={[styles.playerCard, index === 0 && styles.firstPlace]}>
            <View style={styles.mainInfo}>
              <View style={styles.rankInfo}>
                <View style={[styles.rankBadge, index === 0 ? styles.goldBadge : styles.normalBadge]}>
                  <Text style={styles.rankText}>{index + 1}</Text>
                </View>
                <View>
                  <Text style={styles.username}>
                    {item.username} {index === 0 && <Trophy size={14} color="#f59e0b" />}
                  </Text>
                  <Text style={styles.titleText}>{item.title} • Lvl {item.level}</Text>
                  
                  {/* Atributos RPG */}
                  <View style={styles.attrRow}>
                    <View style={styles.attrItem}>
                      <Text style={styles.attrIcon}>🧹</Text>
                      <Text style={styles.attrText}>{item.exp_cleaning || 0}</Text>
                    </View>
                    <View style={styles.attrItem}>
                      <Text style={styles.attrIcon}>👕</Text>
                      <Text style={styles.attrText}>{item.exp_org || 0}</Text>
                    </View>
                    <View style={styles.attrItem}>
                      <Text style={styles.attrIcon}>🍳</Text>
                      <Text style={styles.attrText}>{item.exp_cooking || 0}</Text>
                    </View>
                    <View style={styles.attrItem}>
                      <Flame size={10} color="#f97316" fill="#f97316" />
                      <Text style={styles.attrText}>{item.streak_count || 0}</Text>
                    </View>
                  </View>
                </View>
              </View>
              <View style={styles.pointsInfo}>
                <Text style={styles.pointsText}>{item.total_points}</Text>
                <Text style={styles.xpLabel}>XP TOTAL</Text>
              </View>
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
    paddingBottom: 100,
  },
  playerCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    marginHorizontal: 24,
    marginBottom: 12,
    padding: 16,
    borderRadius: 24,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  firstPlace: {
    backgroundColor: 'rgba(245, 158, 11, 0.05)',
    borderColor: 'rgba(245, 158, 11, 0.1)',
  },
  mainInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  rankInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 16,
    flex: 1,
  },
  rankBadge: {
    width: 36,
    height: 36,
    borderRadius: 12,
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
    fontSize: 16,
  },
  username: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
    marginBottom: 2,
  },
  titleText: {
    color: '#3b82f6',
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  attrRow: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 8,
  },
  attrItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(0,0,0,0.2)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  attrIcon: {
    fontSize: 10,
  },
  attrText: {
    color: '#94a3b8',
    fontSize: 10,
    fontWeight: 'bold',
  },
  pointsInfo: {
    alignItems: 'flex-end',
    marginLeft: 12,
  },
  pointsText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 20,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  xpLabel: {
    color: '#475569',
    fontSize: 8,
    fontWeight: 'bold',
  },
});
