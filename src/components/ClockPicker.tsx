// src/components/ClockPicker.tsx
import { useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

interface ClockPickerProps {
  value: string; // Format "HH:mm" (24-Jam)
  onChange: (time: string) => void;
}

export default function ClockPicker({ value, onChange }: ClockPickerProps) {
  const [modalVisible, setModalVisible] = useState(false);
  const [mode, setMode] = useState<'hour' | 'minute'>('hour');

  // Parse waktu awal (format 24 Jam)
  const [hoursStr, minutesStr] = (value || '08:00').split(':');
  const initialHour24 = parseInt(hoursStr, 10) || 8;
  const initialMinute = parseInt(minutesStr, 10) || 0;

  // State
  const [selectedHour12, setSelectedHour12] = useState<number>(
    initialHour24 % 12 === 0 ? 12 : initialHour24 % 12
  );
  const [selectedMinute, setSelectedMinute] = useState<number>(initialMinute);
  const [period, setPeriod] = useState<'AM' | 'PM'>(initialHour24 >= 12 ? 'PM' : 'AM');

  const openPicker = () => {
    const [h, m] = (value || '08:00').split(':');
    const h24 = parseInt(h, 10) || 8;
    const mVal = parseInt(m, 10) || 0;

    setSelectedHour12(h24 % 12 === 0 ? 12 : h24 % 12);
    setSelectedMinute(mVal);
    setPeriod(h24 >= 12 ? 'PM' : 'AM');
    setMode('hour');
    setModalVisible(true);
  };

  // Konversi balik dari 12 Jam + AM/PM ke Format 24 Jam untuk Database
  const handleConfirm = () => {
    let hour24 = selectedHour12;
    if (period === 'PM' && selectedHour12 < 12) {
      hour24 += 12;
    } else if (period === 'AM' && selectedHour12 === 12) {
      hour24 = 0;
    }

    const formattedHour = String(hour24).padStart(2, '0');
    const formattedMinute = String(selectedMinute).padStart(2, '0');
    
    // Hasil dikirim dalam format 24 Jam ("09:45" atau "21:45")
    onChange(`${formattedHour}:${formattedMinute}`);
    setModalVisible(false);
  };

  // Kalkulasi Angka pada Dial Lingkaran (1 - 12)
  const renderClockNumbers = () => {
    const isHour = mode === 'hour';
    const totalNumbers = 12;
    const radius = 95;
    const centerX = 110;
    const centerY = 110;

    return Array.from({ length: totalNumbers }, (_, i) => {
      const num = isHour ? i + 1 : i * 5; // Jam: 1..12 | Menit: 0, 5, 10..55
      const isSelected = isHour
        ? selectedHour12 === num
        : Math.round(selectedMinute / 5) * 5 % 60 === num % 60;

      const displayNum = isHour ? String(num) : String(num).padStart(2, '0');

      // Posisi lingkaran (Sudut)
      const hourIndex = isHour ? num : num / 5;
      const angle = ((hourIndex - 3) * 30 * Math.PI) / 180;
      const x = centerX + radius * Math.cos(angle) - 18;
      const y = centerY + radius * Math.sin(angle) - 18;

      return (
        <TouchableOpacity
          key={i}
          style={[
            styles.clockNumber,
            { left: x, top: y },
            isSelected && styles.clockNumberSelected,
          ]}
          onPress={() => {
            if (isHour) {
              setSelectedHour12(num);
              setMode('minute'); // Pindah otomatis ke menit
            } else {
              setSelectedMinute(num);
            }
          }}
        >
          <Text style={[styles.clockNumberText, isSelected && styles.clockNumberTextSelected]}>
            {displayNum}
          </Text>
        </TouchableOpacity>
      );
    });
  };

  return (
    <>
      {/* Input Trigger Button */}
      <TouchableOpacity style={styles.triggerButton} onPress={openPicker}>
        <Text style={styles.triggerText}>🕒 {value || '08:00'}</Text>
      </TouchableOpacity>

      {/* Modal Jam Dial */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.pickerCard}>
            <Text style={styles.pickerHeaderTitle}>Pilih Waktu</Text>

            {/* Display Angka Besar + Toggle AM/PM */}
            <View style={styles.displayRow}>
              <View style={styles.timeDisplayContainer}>
                <TouchableOpacity onPress={() => setMode('hour')}>
                  <Text style={[styles.timeDisplayText, mode === 'hour' && styles.timeActive]}>
                    {String(selectedHour12).padStart(2, '0')}
                  </Text>
                </TouchableOpacity>

                <Text style={styles.timeDisplayText}>:</Text>

                <TouchableOpacity onPress={() => setMode('minute')}>
                  <Text style={[styles.timeDisplayText, mode === 'minute' && styles.timeActive]}>
                    {String(selectedMinute).padStart(2, '0')}
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Selector AM / PM */}
              <View style={styles.periodContainer}>
                <TouchableOpacity
                  style={[styles.periodBtn, period === 'AM' && styles.periodBtnActive]}
                  onPress={() => setPeriod('AM')}
                >
                  <Text style={[styles.periodText, period === 'AM' && styles.periodTextActive]}>
                    AM
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.periodBtn, period === 'PM' && styles.periodBtnActive]}
                  onPress={() => setPeriod('PM')}
                >
                  <Text style={[styles.periodText, period === 'PM' && styles.periodTextActive]}>
                    PM
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Sub Label Indicator */}
            <Text style={styles.modeLabel}>
              {mode === 'hour'
                ? `Pilih Jam (${period === 'AM' ? 'Pagi/Siang' : 'Malam'})`
                : 'Pilih Menit'}
            </Text>

            {/* Lingkaran Jam */}
            <View style={styles.clockCircle}>{renderClockNumbers()}</View>

            {/* Actions */}
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.btnSecondary} onPress={() => setModalVisible(false)}>
                <Text style={styles.btnSecondaryText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btnPrimary} onPress={handleConfirm}>
                <Text style={styles.btnPrimaryText}>OK</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  triggerButton: {
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    padding: 10,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    marginBottom: 14,
  },
  triggerText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#0f172a',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  pickerCard: {
    width: 320,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    elevation: 5,
  },
  pickerHeaderTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#64748b',
    marginBottom: 12,
  },
  displayRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  timeDisplayContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 12,
  },
  timeDisplayText: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#94a3b8',
  },
  timeActive: {
    color: '#2563eb',
  },
  periodContainer: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 8,
    overflow: 'hidden',
  },
  periodBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    backgroundColor: '#ffffff',
  },
  periodBtnActive: {
    backgroundColor: '#2563eb',
  },
  periodText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#64748b',
  },
  periodTextActive: {
    color: '#ffffff',
  },
  modeLabel: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 16,
  },
  clockCircle: {
    width: 230,
    height: 230,
    borderRadius: 115,
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    position: 'relative',
    marginBottom: 20,
  },
  clockNumber: {
    position: 'absolute',
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  clockNumberSelected: {
    backgroundColor: '#2563eb',
  },
  clockNumberText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#334155',
  },
  clockNumberTextSelected: {
    color: '#ffffff',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    width: '100%',
    gap: 12,
  },
  btnSecondary: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 6,
  },
  btnSecondaryText: {
    color: '#64748b',
    fontWeight: '600',
  },
  btnPrimary: {
    backgroundColor: '#2563eb',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 6,
  },
  btnPrimaryText: {
    color: '#ffffff',
    fontWeight: 'bold',
  },
});