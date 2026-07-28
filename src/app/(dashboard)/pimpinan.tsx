// src/app/(dashboard)/pimpinan.tsx
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/auth-context';

export default function PimpinanDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.badge}>Role: PIMPINAN</Text>
      <Text style={styles.title}>Dashboard Pimpinan</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <View style={styles.menuBox}>
        <Text style={styles.menuTitle}>Menu Pengawasan:</Text>
        <Text>• Rekapitulasi Absensi Divisi</Text>
        <Text>• Persetujuan / Approval Cuti</Text>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#f1f5f9' },
  badge: { backgroundColor: '#10b981', color: '#fff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start', fontWeight: 'bold', fontSize: 12 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 12, color: '#0f172a' },
  email: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  menuBox: { backgroundColor: '#fff', padding: 16, borderRadius: 8, gap: 8, marginBottom: 24 },
  menuTitle: { fontWeight: 'bold', marginBottom: 8 },
  logoutButton: { backgroundColor: '#dc2626', padding: 12, borderRadius: 8, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: 'bold' },
});