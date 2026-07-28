// src/app/login.tsx
import { useRouter } from 'expo-router';
import { useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../context/auth-context';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  
  // State untuk menyimpan pesan error
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { login } = useAuth();
  const router = useRouter();

  const handleLogin = async () => {
    // Reset pesan error setiap kali tombol dipencet
    setErrorMessage(null);

    if (!email.trim() || !password) {
      setErrorMessage('Email dan password tidak boleh kosong!');
      return;
    }

    setSubmitting(true);
    try {
      const role = await login({ email, password });

      if (role === 'ADMIN') {
        router.replace('/(dashboard)/admin');
      } else if (role === 'PIMPINAN') {
        router.replace('/(dashboard)/pimpinan');
      } else {
        router.replace('/(dashboard)/pegawai');
      }
    } catch (error: any) {
      // Menangkap pesan error dari response backend NestJS (misal status 401)
      const msg = error.response?.data?.message || 'Email atau password yang Anda masukkan salah.';
      
      // Jika NestJS mengembalikan array pesan error
      if (Array.isArray(msg)) {
        setErrorMessage(msg.join(', '));
      } else {
        setErrorMessage(msg);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Absensi App</Text>
      <Text style={styles.subtitle}>Silakan masuk menggunakan akun Anda</Text>

      <View style={styles.form}>
        {/* BANNER ERROR */}
        {errorMessage && (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {errorMessage}</Text>
          </View>
        )}

        <Text style={styles.label}>Email</Text>
        <TextInput
          style={[styles.input, errorMessage ? styles.inputError : null]}
          placeholder="admin@absensi.com"
          value={email}
          onChangeText={(val) => {
            setEmail(val);
            if (errorMessage) setErrorMessage(null); // Sembunyikan error saat user mulai mengetik ulang
          }}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Password</Text>
        <TextInput
          style={[styles.input, errorMessage ? styles.inputError : null]}
          placeholder="••••••••"
          value={password}
          onChangeText={(val) => {
            setPassword(val);
            if (errorMessage) setErrorMessage(null);
          }}
          secureTextEntry
        />

        <TouchableOpacity style={styles.button} onPress={handleLogin} disabled={submitting}>
          {submitting ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Masuk</Text>
          )}
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', padding: 24, backgroundColor: '#f8fafc' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0f172a', textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#64748b', textAlign: 'center', marginBottom: 24, marginTop: 4 },
  form: { backgroundColor: '#ffffff', padding: 20, borderRadius: 12, elevation: 2 },
  
  // Style khusus kotak error
  errorBox: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  errorText: { color: '#dc2626', fontSize: 13, fontWeight: '500' },
  inputError: { borderColor: '#ef4444' },

  label: { fontSize: 14, fontWeight: '600', color: '#334155', marginBottom: 6 },
  input: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 14,
  },
  button: {
    backgroundColor: '#2563eb',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: { color: '#ffffff', fontWeight: 'bold', fontSize: 16 },
});