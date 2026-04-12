import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { X, Trash2, Edit3, Check, Save, Zap, Clock, User } from 'lucide-react-native';
import { taskService } from '../services/api';
import * as Haptics from 'expo-haptics';

interface TaskDetailsModalProps {
  visible: boolean;
  task: any | null;
  onClose: () => void;
  onSuccess: () => void;
  onComplete: (taskId: string) => void;
}

const CATEGORIES = [
  { id: 'cleaning', name: 'Limpeza', icon: '🧹' },
  { id: 'organization', name: 'Organização', icon: '👕' },
  { id: 'cooking', name: 'Culinária', icon: '🍳' },
  { id: 'other', name: 'Outro', icon: '✨' },
];

export function TaskDetailsModal({ visible, task, onClose, onSuccess, onComplete }: TaskDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [points, setPoints] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (task) {
      setName(task.name);
      setPoints(task.points.toString());
      setDescription(task.description || '');
      setCategory(task.category || 'other');
      setIsEditing(false);
    }
  }, [task]);

  const handleUpdate = async () => {
    if (!name.trim()) return;
    setLoading(true);
    try {
      await taskService.update(task.id, {
        name,
        points: parseInt(points) || 100,
        description,
        category
      });
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      onSuccess();
      setIsEditing(false);
    } catch (err) {
      console.error(err);
      Alert.alert('Erro', 'Não foi possível atualizar a tarefa.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Excluir Tarefa',
      'Tem certeza que deseja excluir esta tarefa permanentemente?',
      [
        { text: 'Cancelar', style: 'cancel' },
        { 
          text: 'Excluir', 
          style: 'destructive',
          onPress: async () => {
            setLoading(true);
            try {
              await taskService.delete(task.id);
              Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
              onSuccess();
              onClose();
            } catch (err) {
              console.error(err);
              Alert.alert('Erro', 'Não foi possível excluir a tarefa.');
            } finally {
              setLoading(false);
            }
          }
        }
      ]
    );
  };

  if (!task) return null;

  return (
    <Modal visible={visible} animationType="fade" transparent>
      <View style={styles.overlay}>
        <View style={styles.content}>
          <View style={styles.header}>
            <Text style={styles.title}>{isEditing ? 'Editar Tarefa' : 'Detalhes da Tarefa'}</Text>
            <TouchableOpacity onPress={onClose} disabled={loading}>
              <X color="#94a3b8" size={24} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.body} showsVerticalScrollIndicator={false}>
            {isEditing ? (
              <View style={styles.form}>
                <Text style={styles.label}>O que precisa ser feito?</Text>
                <TextInput
                  style={styles.input}
                  value={name}
                  onChangeText={setName}
                  placeholder="Nome da tarefa"
                  placeholderTextColor="#475569"
                />

                <Text style={styles.label}>Recompensa (XP)</Text>
                <TextInput
                  style={styles.input}
                  value={points}
                  onChangeText={setPoints}
                  keyboardType="number-pad"
                  placeholder="Pontos"
                  placeholderTextColor="#475569"
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

                <Text style={styles.label}>Descrição (opcional)</Text>
                <TextInput
                  style={[styles.input, { height: 80 }]}
                  value={description}
                  onChangeText={setDescription}
                  multiline
                  placeholder="Adicione mais detalhes..."
                  placeholderTextColor="#475569"
                />
              </View>
            ) : (
              <View>
                <View style={styles.infoRow}>
                    <View style={styles.iconBg}>
                        <Text style={{ fontSize: 32 }}>
                            {category === 'cleaning' ? '🧹' : category === 'organization' ? '👕' : category === 'cooking' ? '🍳' : '✨'}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }}>
                        <Text style={styles.taskNameDisplay}>{task.name}</Text>
                        <View style={styles.tagRow}>
                            <View style={styles.pointsBadge}>
                                <Zap size={12} color="#fbbf24" fill="#fbbf24" />
                                <Text style={styles.pointsLabel}>{task.points} XP</Text>
                            </View>
                            <Text style={styles.categoryLabel}>{category.toUpperCase()}</Text>
                        </View>
                    </View>
                </View>

                {task.description ? (
                    <View style={styles.descBox}>
                        <Text style={styles.descText}>{task.description}</Text>
                    </View>
                ) : null}

                <View style={styles.metaInfo}>
                    <View style={styles.metaItem}>
                        <Clock size={14} color="#64748b" />
                        <Text style={styles.metaText}>Criada em {new Date(task.created_at).toLocaleDateString()}</Text>
                    </View>
                    {task.profiles && (
                        <View style={styles.metaItem}>
                            <User size={14} color="#64748b" />
                            <Text style={styles.metaText}>Proposta por {task.profiles.username}</Text>
                        </View>
                    )}
                </View>
              </View>
            )}
          </ScrollView>

          <View style={styles.footer}>
            {isEditing ? (
              <TouchableOpacity 
                style={styles.saveBtn} 
                onPress={handleUpdate}
                disabled={loading}
              >
                {loading ? <ActivityIndicator color="white" /> : (
                  <>
                    <Save size={20} color="white" />
                    <Text style={styles.btnText}>Salvar Alterações</Text>
                  </>
                )}
              </TouchableOpacity>
            ) : (
              <View style={styles.actionRow}>
                <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete} disabled={loading}>
                    <Trash2 size={20} color="#ef4444" />
                </TouchableOpacity>
                <TouchableOpacity style={styles.editBtn} onPress={() => setIsEditing(true)} disabled={loading}>
                    <Edit3 size={20} color="#94a3b8" />
                    <Text style={styles.editBtnText}>Editar</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    style={styles.completeBtn} 
                    onPress={() => {
                        onClose();
                        onComplete(task.id);
                    }} 
                    disabled={loading}
                >
                    <Check size={20} color="white" />
                    <Text style={styles.completeBtnText}>Concluir</Text>
                </TouchableOpacity>
              </View>
            )}
            
            {isEditing && (
                <TouchableOpacity style={styles.cancelLink} onPress={() => setIsEditing(false)} disabled={loading}>
                    <Text style={styles.cancelText}>Cancelar Edição</Text>
                </TouchableOpacity>
            )}
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.85)',
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    backgroundColor: '#0f172a',
    borderRadius: 32,
    padding: 24,
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    color: '#94a3b8',
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'uppercase',
    letterSpacing: 1.5,
  },
  body: {
    marginBottom: 24,
  },
  infoRow: {
    flexDirection: 'row',
    gap: 20,
    alignItems: 'center',
    marginBottom: 24,
  },
  iconBg: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(255,255,255,0.03)',
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)',
  },
  taskNameDisplay: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  pointsBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(251, 191, 36, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pointsLabel: {
    color: '#fbbf24',
    fontSize: 12,
    fontWeight: 'bold',
  },
  categoryLabel: {
    color: '#64748b',
    fontSize: 10,
    fontWeight: '900',
  },
  descBox: {
    backgroundColor: 'rgba(255,255,255,0.02)',
    padding: 20,
    borderRadius: 20,
    marginBottom: 24,
  },
  descText: {
    color: '#94a3b8',
    fontSize: 14,
    lineHeight: 22,
  },
  metaInfo: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  metaText: {
    color: '#475569',
    fontSize: 12,
  },
  form: {
    gap: 16,
  },
  label: {
    color: '#64748b',
    fontSize: 12,
    fontWeight: 'bold',
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
  footer: {
    gap: 12,
  },
  actionRow: {
    flexDirection: 'row',
    gap: 12,
  },
  deleteBtn: {
    width: 56,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: {
    flex: 1,
    height: 56,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.05)',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  editBtnText: {
    color: '#94a3b8',
    fontWeight: 'bold',
  },
  completeBtn: {
    flex: 2,
    height: 56,
    borderRadius: 16,
    backgroundColor: '#3b82f6',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  completeBtnText: {
    color: 'white',
    fontWeight: 'bold',
  },
  saveBtn: {
    backgroundColor: '#22c55e',
    height: 56,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  btnText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
  cancelLink: {
    alignItems: 'center',
    padding: 8,
  },
  cancelText: {
    color: '#64748b',
    fontSize: 14,
  },
});
