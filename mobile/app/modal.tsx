import { StatusBar } from 'expo-status-bar';
import { Platform, StyleSheet, View, Text, TextInput, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { useState } from 'react';
import { taskService } from '../services/api';
import { Plus, Star } from 'lucide-react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { router } from 'expo-router';

export default function ModalScreen() {
  const [name, setName] = useState('');
  const [points, setPoints] = useState(50);
  const [description, setDescription] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await taskService.propose({ name, points, description });
      Alert.alert("Sucesso", "Proposta enviada para aprovação dos moradores!");
      router.back();
    } catch (err: any) {
      Alert.alert("Erro", "Não foi possível enviar a proposta");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />
      
      <View style={styles.header}>
        <Plus size={32} color="#3b82f6" />
        <Text style={styles.title}>Nova Proposta</Text>
        <Text style={styles.subtitle}>Sua tarefa aparecerá após a aprovação</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.field}>
          <Text style={styles.label}>NOME DA TAREFA</Text>
          <TextInput
            style={styles.input}
            placeholder="Ex: Lavar janelas"
            placeholderTextColor="#64748b"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.field}>
            <View style={styles.labelRow}>
                <Text style={styles.label}>PONTUAÇÃO (XP)</Text>
                <Text style={styles.pointValue}>{points}</Text>
            </View>
            <View style={styles.pointsGrid}>
                {[50, 100, 150, 200].map(p => (
                    <TouchableOpacity 
                        key={p} 
                        onPress={() => setPoints(p)}
                        style={[styles.pointBtn, points === p && styles.pointBtnActive]}
                    >
                        <Text style={[styles.pointBtnText, points === p && styles.pointBtnTextActive]}>{p}</Text>
                    </TouchableOpacity>
                ))}
            </View>
        </View>

        <View style={styles.field}>
          <Text style={styles.label}>DESCRIÇÃO</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Como deve ser feito?"
            placeholderTextColor="#64748b"
            value={description}
            onChangeText={setDescription}
            multiline
            numberOfLines={4}
          />
        </View>

        <TouchableOpacity 
            style={styles.submitBtn} 
            onPress={handleSubmit}
            disabled={loading || !name}
        >
            <LinearGradient colors={['#2563eb', '#4f46e5']} style={styles.btnGradient}>
                {loading ? <ActivityIndicator color="white" /> : (
                    <>
                        <Text style={styles.btnText}>Propor Tarefa</Text>
                        <Star size={18} color="white" />
                    </>
                )}
            </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#020617',
    padding: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 40,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginTop: 12,
  },
  subtitle: {
    color: '#64748b',
    fontSize: 14,
    marginTop: 4,
  },
  form: {
    gap: 24,
  },
  field: {
    gap: 8,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  label: {
    color: '#475569',
    fontSize: 10,
    fontWeight: 'bold',
    letterSpacing: 2,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  textArea: {
    height: 120,
    paddingTop: 16,
    textAlignVertical: 'top',
  },
  pointValue: {
    color: '#3b82f6',
    fontWeight: 'bold',
    fontSize: 18,
  },
  pointsGrid: {
    flexDirection: 'row',
    gap: 8,
  },
  pointBtn: {
    flex: 1,
    height: 44,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  pointBtnActive: {
    backgroundColor: 'rgba(59, 130, 246, 0.2)',
    borderColor: '#3b82f6',
  },
  pointBtnText: {
    color: '#64748b',
    fontWeight: 'bold',
  },
  pointBtnTextActive: {
    color: '#3b82f6',
  },
  submitBtn: {
    borderRadius: 16,
    overflow: 'hidden',
    marginTop: 12,
  },
  btnGradient: {
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
  },
  btnText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
