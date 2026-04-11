import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { X, Gift, Coins } from 'lucide-react-native';
import api from '../services/api';

interface AddRewardModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groupId: string;
}

export function AddRewardModal({ visible, onClose, onSuccess, groupId }: AddRewardModalProps) {
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('500');
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!title.trim()) return;
    
    setLoading(true);
    try {
      // Usaremos o endpoint direto aqui ou adicionaremos ao service
      await api.post('/marketplace/rewards', {
        title,
        price_points: parseInt(price) || 500,
        description,
        group_id: groupId,
        is_default: false
      });
      onSuccess();
      setTitle('');
      setDescription('');
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal visible={visible} animationType="slide" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>Nova Recompensa</Text>
            <TouchableOpacity onPress={onClose}>
              <X color="#94a3b8" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>O que é o prêmio?</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Vale Pizza, Escolher o Filme"
              placeholderTextColor="#475569"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Custo em XP</Text>
            <View style={styles.priceContainer}>
                <Coins size={20} color="#fbbf24" />
                <TextInput
                style={[styles.input, { flex: 1 }]}
                placeholder="500"
                keyboardType="number-pad"
                placeholderTextColor="#475569"
                value={price}
                onChangeText={setPrice}
                />
            </View>

            <Text style={styles.label}>Descrição (opcional)</Text>
            <TextInput
              style={[styles.input, { height: 80 }]}
              placeholder="Ex: Válido para uma pizza de qualquer sabor no final de semana."
              placeholderTextColor="#475569"
              multiline
              value={description}
              onChangeText={setDescription}
            />

            <TouchableOpacity 
              style={[styles.submitBtn, !title && styles.submitBtnDisabled]} 
              onPress={handleCreate}
              disabled={loading || !title}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitText}>Criar Recompensa</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'flex-end',
  },
  content: {
    backgroundColor: '#0f172a',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: '60%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  title: {
    color: 'white',
    fontSize: 20,
    fontWeight: '700',
  },
  form: {
    gap: 16,
  },
  label: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 4,
  },
  input: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 16,
    color: 'white',
    fontSize: 16,
  },
  priceContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 12,
  },
  submitBtn: {
    backgroundColor: '#fbbf24',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: '#0f172a',
    fontSize: 16,
    fontWeight: '700',
  },
});
