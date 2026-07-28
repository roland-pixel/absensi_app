// src/app/(dashboard)/admin.tsx
import { useRouter } from 'expo-router';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useAuth } from '../../context/auth-context';

export default function AdminDashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = async () => {
    await logout();
    router.replace('/login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.badge}>Role: ADMIN</Text>
      <Text style={styles.title}>Selamat Datang, Admin!</Text>
      <Text style={styles.email}>{user?.email}</Text>

      <View style={styles.menuBox}>
        <Text style={styles.menuTitle}>Akses Modul Admin:</Text>
        
        {/* Kelola Divisi */}
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => router.push('/(dashboard)/divisi')}
        >
          <Text style={styles.menuItemText}>🏢 Kelola Divisi</Text>
        </TouchableOpacity>

        {/* Kelola Jabatan */}
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => router.push('/(dashboard)/jabatan')}
        >
          <Text style={styles.menuItemText}>💼 Kelola Jabatan</Text>
        </TouchableOpacity>

        {/* Kelola Jam Kerja */}
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => router.push('/(dashboard)/jam-kerja')}
        >
          <Text style={styles.menuItemText}>⏰ Kelola Jam Kerja</Text>
        </TouchableOpacity>

        {/* Kelola Kantor */}
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => router.push('/(dashboard)/kantor')}
        >
          <Text style={styles.menuItemText}>📍 Kelola Kantor</Text>
        </TouchableOpacity>

        {/* Kelola Tipe Cuti */}
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => router.push('/(dashboard)/tipe-cuti')}
        >
          <Text style={styles.menuItemText}>🏖️ Kelola Tipe Cuti</Text>
        </TouchableOpacity>

        {/* Kelola User */}
        <TouchableOpacity 
          style={styles.menuItem} 
          onPress={() => router.push('/(dashboard)/users')}
        >
          <Text style={styles.menuItemText}>👥 Kelola User / Pegawai</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 24, justifyContent: 'center', backgroundColor: '#f1f5f9' },
  badge: { backgroundColor: '#ef4444', color: '#fff', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, alignSelf: 'flex-start', fontWeight: 'bold', fontSize: 12 },
  title: { fontSize: 24, fontWeight: 'bold', marginTop: 12, color: '#0f172a' },
  email: { fontSize: 14, color: '#64748b', marginBottom: 24 },
  menuBox: { backgroundColor: '#fff', padding: 16, borderRadius: 8, gap: 10, marginBottom: 24 },
  menuTitle: { fontWeight: 'bold', marginBottom: 4, color: '#334155' },
  
  menuItem: {
    backgroundColor: '#eff6ff',
    borderColor: '#bfdbfe',
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
  },
  menuItemText: { color: '#1d4ed8', fontWeight: 'bold', fontSize: 15 },

  logoutButton: { backgroundColor: '#dc2626', padding: 12, borderRadius: 8, alignItems: 'center' },
  logoutText: { color: '#fff', fontWeight: 'bold' },
});