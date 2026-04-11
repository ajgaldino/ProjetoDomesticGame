import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, FlatList, TouchableOpacity, ActivityIndicator, Alert, RefreshControl } from 'react-native';
import { ShoppingBag, Coins, Gift, ShoppingCart, User } from 'lucide-react-native';
import * as Haptics from 'expo-haptics';
import { taskService } from '../../services/api';
import { supabase } from '../../lib/supabase';

export default function ShopScreen() {
  const [loading, setLoading] = useState(true);
  const [rewards, setRewards] = useState<any[]>([]);
  const [profile, setProfile] = useState<any>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const [rewardRes, profileRes] = await Promise.all([
        taskService.getRewards(),
        supabase.from('profiles').select('*').eq('id', user.id).single()
      ]);

      setRewards(rewardRes.data);
      setProfile(profileRes.data);
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

  const handlePurchase = async (reward: any) => {
    if (profile.total_points < reward.price_points) {
      Alert.alert('Saldo Insuficiente', 'Você ainda não tem XP suficiente para esta recompensa. Continue fazendo as tarefas!');
      return;
    }

    Alert.alert(
      'Resgatar Recompensa',
      `Deseja usar ${reward.price_points} XP para resgatar "${reward.title}"?`,
      [
        { text: 'Cancelar', style: 'cancel' },
        {
          text: 'Resgatar',
          onPress: async () => {
            try {
              await taskService.purchaseReward(reward.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
              Alert.alert('Sucesso!', 'Você resgatou a recompensa! O código ou o aviso foi enviado para o grupo.');
              fetchData();
            } catch (err: any) {
              Alert.alert('Erro', err.response?.data?.detail || 'Não foi possível completar o resgate.');
            }
          }
        }
      ]
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
        <View>
          <Text style={styles.title}>Loja de Recompensas</Text>
          <Text style={styles.subtitle}>Troque seu esforço por mimos!</Text>
        </View>
        <View style={styles.balanceCard}>
          <Coins size={16} color="#fbbf24" fill="#fbbf24" />
          <Text style={styles.balanceText}>{profile?.total_points || 0} XP</Text>
        </View>
      </View>

      <FlatList
        data={rewards}
        keyExtractor={(item) => item.id}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={fetchData} tintColor="#3b82f6" />}
        contentContainerStyle={styles.list}
        numColumns={2}
        renderItem={({ item }) => (
          <TouchableOpacity style={styles.card} onPress={() => handlePurchase(item)}>
            <View style={styles.iconContainer}>
              <Gift size={32} color="#3b82f6" />
            </View>
            <Text style={styles.rewardTitle} numberOfLines={1}>{item.title}</Text>
            <Text style={styles.rewardDesc} numberOfLines={2}>{item.description || 'Sem descrição.'}</Text>
            <View style={styles.priceTag}>
              <Text style={styles.priceText}>{item.price_points} XP</Text>
            </View>
          </TouchableOpacity>
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <ShoppingBag size={48} color="#1e293b" />
            <Text style={styles.emptyText}>Nenhuma recompensa disponível ainda. Peça para o dono da casa cadastrar!</Text>
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
    paddingBottom: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#020617',
  },
  title: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
  },
  subtitle: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
  balanceCard: {
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'rgba(251, 191, 36, 0.2)',
  },
  balanceText: {
    color: '#fbbf24',
    fontWeight: 'bold',
    fontSize: 14,
  },
  list: {
    padding: 16,
    paddingBottom: 100,
  },
  card: {
    flex: 1,
    backgroundColor: '#0f172a',
    borderRadius: 20,
    padding: 16,
    margin: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  iconContainer: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  rewardTitle: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 14,
    textAlign: 'center',
  },
  rewardDesc: {
    color: '#94a3b8',
    fontSize: 10,
    textAlign: 'center',
    marginTop: 4,
    height: 30,
  },
  priceTag: {
    backgroundColor: '#3b82f6',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    marginTop: 12,
  },
  priceText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 12,
  },
  empty: {
    flex: 1,
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
