import React, { useState } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import { Home, ArrowRight, Plus } from 'lucide-react-native';
import { groupService } from '../services/api';
import { LinearGradient } from 'expo-linear-gradient';

export function GroupManagerMobile({ onJoined }: { onJoined: () => void }) {
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState<'create' | 'join' | null>(null);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');

  const handleCreate = async () => {
    setLoading(true);
    try {
      await groupService.create(name);
      onJoined();
    } catch (err: any) {
      Alert.alert("Erro", err.response?.data?.detail || "Erro ao criar grupo");
    } finally {
      setLoading(false);
    }
  };

  const handleJoin = async () => {
    setLoading(true);
    try {
      await groupService.join(code);
      onJoined();
    } catch (err: any) {
      Alert.alert("Erro", "Código inválido ou erro ao entrar");
    } finally {
      setLoading(false);
    }
  };

  if (!mode) {
    return (
      <View style={styles.container}>
        <View style={styles.iconCircle}>
          <Home size={40} color="#3b82f6" />
        </View>
        <Text style={styles.welcome}>Sua Casa, Sua Jornada</Text>
        <Text style={styles.desc}>Você ainda não faz parte de nenhuma casa no DomesticQuest.</Text>
        
        <TouchableOpacity style={styles.optionCard} onPress={() => setMode('create')}>
          <View>
            <Text style={styles.optionTitle}>Criar uma Casa</Text>
            <Text style={styles.optionDesc}>Comece um novo grupo do zero</Text>
          </View>
          <ArrowRight color="#3b82f6" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.optionCard} onPress={() => setMode('join')}>
          <View>
            <Text style={styles.optionTitle}>Entrar em uma Casa</Text>
            <Text style={styles.optionDesc}>Use um código de convite</Text>
          </View>
          <ArrowRight color="#8b5cf6" />
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.formContainer}>
      <TouchableOpacity onPress={() => setMode(null)} style={styles.backButton}>
        <Text style={styles.backText}>← Voltar</Text>
      </TouchableOpacity>
      
      <View style={styles.card}>
        <Text style={styles.cardTitle}>
            {mode === 'create' ? 'Nomeie sua Residência' : 'Digite o Código'}
        </Text>

        {mode === 'create' ? (
            <TextInput
                style={styles.input}
                placeholder="Ex: Mansão Wayne, Nossa Casa..."
                placeholderTextColor="#64748b"
                value={name}
                onChangeText={setName}
            />
        ) : (
            <TextInput
                style={[styles.input, styles.codeInput]}
                placeholder="CÓDIGO"
                placeholderTextColor="#64748b"
                value={code}
                onChangeText={(t) => setCode(t.toUpperCase())}
                maxLength={6}
                autoCapitalize="characters"
            />
        )}

        <TouchableOpacity 
            style={styles.confirmButton} 
            onPress={mode === 'create' ? handleCreate : handleJoin}
            disabled={loading || (mode === 'create' ? !name : !code)}
        >
            <LinearGradient colors={['#2563eb', '#4f46e5']} style={styles.buttonGradient}>
                {loading ? <ActivityIndicator color="white" /> : <Text style={styles.buttonText}>Confirmar</Text>}
            </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 24,
    alignItems: 'center',
  },
  iconCircle: {
    width: 80,
    height: 80,
    backgroundColor: 'rgba(59, 130, 246, 0.1)',
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
  },
  welcome: {
    fontSize: 24,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 8,
    textAlign: 'center',
  },
  desc: {
    color: '#94a3b8',
    textAlign: 'center',
    marginBottom: 40,
    fontSize: 14,
  },
  optionCard: {
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 24,
    borderRadius: 24,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'between',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  optionTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
  optionDesc: {
    color: '#64748b',
    fontSize: 12,
    marginTop: 4,
  },
  formContainer: {
    padding: 24,
  },
  backButton: {
    marginBottom: 24,
  },
  backText: {
    color: '#64748b',
    fontSize: 14,
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    padding: 32,
    borderRadius: 32,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 24,
  },
  input: {
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 16,
    height: 56,
    paddingHorizontal: 16,
    color: 'white',
    fontSize: 16,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: 24,
  },
  codeInput: {
    textAlign: 'center',
    fontSize: 28,
    letterSpacing: 8,
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
  },
  confirmButton: {
    borderRadius: 16,
    overflow: 'hidden',
  },
  buttonGradient: {
    height: 56,
    justifyContent: 'center',
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
