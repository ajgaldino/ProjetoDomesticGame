import React, { useState } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { X, Plus, ShieldCheck, ShoppingCart, Sparkles } from 'lucide-react-native';
import { taskService } from '../services/api';

interface AddTaskModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess: () => void;
  groupId: string;
}

const CATEGORIES = [
  { id: 'cleaning', name: 'Limpeza', icon: '🧹' },
  { id: 'organization', name: 'Organização', icon: '👕' },
  { id: 'cooking', name: 'Culinária', icon: '🍳' },
  { id: 'other', name: 'Outro', icon: '✨' },
];

export function AddTaskModal({ visible, onClose, onSuccess, groupId }: AddTaskModalProps) {
  const [name, setName] = useState('');
  const [points, setPoints] = useState('100');
  const [category, setCategory] = useState('cleaning');
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!name.trim()) return;
    
    setLoading(true);
    try {
      await taskService.create({
        name,
        points: parseInt(points) || 100,
        group_id: groupId,
        category,
        description: ''
      });
      onSuccess();
      setName('');
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
            <Text style={styles.title}>Nova Tarefa</Text>
            <TouchableOpacity onPress={onClose}>
              <X color="#94a3b8" size={24} />
            </TouchableOpacity>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>O que precisa ser feito?</Text>
            <TextInput
              style={styles.input}
              placeholder="Ex: Lavar louça da janta"
              placeholderTextColor="#475569"
              value={name}
              onChangeText={setName}
            />

            <Text style={styles.label}>Recompensa (XP)</Text>
            <TextInput
              style={styles.input}
              placeholder="100"
              keyboardType="number-pad"
              placeholderTextColor="#475569"
              value={points}
              onChangeText={setPoints}
            />

            <Text style={styles.label}>Categoria</Text>
            <View style={styles.categories}>
              {CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryBtn,
                    category === cat.id && styles.categoryBtnActive
                  ]}
                  onPress={() => setCategory(cat.id)}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text style={[
                      styles.categoryName,
                      category === cat.id && styles.categoryNameActive
                  ]}>{cat.name}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity 
              style={[styles.submitBtn, !name && styles.submitBtnDisabled]} 
              onPress={handleCreate}
              disabled={loading || !name}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text style={styles.submitText}>Criar Tarefa</Text>
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
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  categoryBtn: {
    backgroundColor: '#1e293b',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  categoryBtnActive: {
    borderColor: '#3b82f6',
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
  },
  categoryIcon: {
    fontSize: 16,
  },
  categoryName: {
    color: '#94a3b8',
    fontSize: 14,
    fontWeight: '500',
  },
  categoryNameActive: {
    color: '#3b82f6',
  },
  submitBtn: {
    backgroundColor: '#3b82f6',
    borderRadius: 12,
    padding: 18,
    alignItems: 'center',
    marginTop: 24,
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
  submitText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '700',
  },
});
