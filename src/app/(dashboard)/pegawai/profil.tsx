// src/app/(dashboard)/pegawai/profil.tsx
import { useRouter } from 'expo-router';
import {
    SafeAreaView,
    ScrollView,
    StatusBar,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from 'react-native';
import { useAuth } from '../../../context/auth-context';

export default function ProfilScreen() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#f8fafc" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarLarge}>
            <Text style={styles.avatarLargeText}>
              {(user?.nama_lengkap || 'A').charAt(0).toUpperCase()}
            </Text>
          </View>
          <Text style={styles.profileName}>{user?.nama_lengkap || 'Ahmad Rifai'}</Text>
          <Text style={styles.profileEmail}>{user?.email || 'ahmad.rifai@company.com'}</Text>
          <View style={styles.roleChip}>
            <Text style={styles.roleChipText}>{user?.role || 'PEGAWAI'}</Text>
          </View>
        </View>

        <View style={styles.profileDetailsCard}>
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>NIK</Text>
            <Text style={styles.detailValue}>{user?.nik || '1998012301'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Divisi</Text>
            <Text style={styles.detailValue}>{user?.divisi?.nama_divisi || 'Teknologi Informasi'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Jabatan</Text>
            <Text style={styles.detailValue}>{user?.jabatan?.nama_jabatan || 'Software Engineer'}</Text>
          </View>
          <View style={styles.divider} />
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Kantor</Text>
            <Text style={styles.detailValue}>{user?.kantor?.nama_kantor || 'Kantor Pusat'}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            logout?.();
            router.replace('/login');
          }}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>🚪 Keluar / Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: { flex: 1, backgroundColor: '#f8fafc' },
  scrollContent: { padding: 16, paddingBottom: 24 },
  profileHeader: { alignItems: 'center', marginBottom: 20, marginTop: 10 },
  avatarLarge: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#2563eb', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  avatarLargeText: { color: '#ffffff', fontSize: 32, fontWeight: 'bold' },
  profileName: { fontSize: 18, fontWeight: 'bold', color: '#0f172a' },
  profileEmail: { fontSize: 13, color: '#64748b', marginTop: 2 },
  roleChip: { backgroundColor: '#e0f2fe', paddingHorizontal: 12, paddingVertical: 4, borderRadius: 12, marginTop: 8 },
  roleChipText: { color: '#0284c7', fontSize: 11, fontWeight: 'bold' },
  profileDetailsCard: { backgroundColor: '#ffffff', borderRadius: 12, padding: 16, marginBottom: 20, borderWidth: 1, borderColor: '#e2e8f0' },
  detailRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  detailLabel: { fontSize: 13, color: '#64748b' },
  detailValue: { fontSize: 13, fontWeight: '600', color: '#0f172a' },
  divider: { height: 1, backgroundColor: '#f1f5f9', marginVertical: 10 },
  logoutButton: { backgroundColor: '#fee2e2', paddingVertical: 12, borderRadius: 10, alignItems: 'center' },
  logoutButtonText: { color: '#dc2626', fontWeight: 'bold', fontSize: 14 },
});