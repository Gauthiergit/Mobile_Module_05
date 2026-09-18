
import { 
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { DiaryEntry } from '../../models/DiaryEntry';
import { AntDesign } from '@expo/vector-icons';
import { Feeling, feelingRecord } from '../../types/Feeling';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../../theme';

interface DetailEntryModalProps {
  entry: DiaryEntry | null
  visible: boolean;
  onClose: () => void;
}

export default function DetailEntryModal({ entry, visible, onClose }: DetailEntryModalProps) {
  
  return (
      <Modal
        animationType="slide"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
        supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
      >
        <SafeAreaView style={styles.detailModalOverlay}>
          <View style={styles.detailModalContent}>
            
            {/* Bouton pour fermer */}
            <TouchableOpacity 
              style={styles.closeDetailBtn} 
              onPress={onClose}
            >
              <AntDesign name="close" size={28} color="#9ca3af" />
            </TouchableOpacity>

            {/* Contenu de la modale */}
            {entry && (() => {
              const dateStr = entry.date instanceof Date ? entry.date.toLocaleDateString('fr-FR') : 'Aujourd\'hui';
              const currentFeeling = feelingRecord[entry.feeling as Feeling] || feelingRecord[Feeling.Neutral];
              const IconComponent = currentFeeling.icon;
              const currentColor = currentFeeling.color;
              const currentLabel = currentFeeling.label

              return (
                <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.detailScrollContent}>
                  
                  <View style={styles.detailHeader}>
                    <Text style={styles.detailTitle}>{entry.title}</Text>
                    <Text style={styles.detailDate}>{dateStr}</Text>
                  </View>

                  <View style={styles.detailFeelingContainer}>
                    <IconComponent size={24} color={currentColor} />
                    <Text style={[styles.detailFeelingText, { color: currentColor }]}>
                      {currentLabel}
                    </Text>
                  </View>

                  <View style={styles.separator} />

                  <Text style={styles.detailContentText}>
                    {entry.content}
                  </Text>
                  
                </ScrollView>
              );
            })()}
          </View>
        </SafeAreaView>
      </Modal>
  );
}

const styles = StyleSheet.create({
  detailModalOverlay: { flex: 1, backgroundColor: 'rgba(31, 64, 55, 0.42)', justifyContent: 'flex-end' },
  detailModalContent: { backgroundColor: colors.paper, borderTopLeftRadius: 24, borderTopRightRadius: 24, minHeight: '60%', maxHeight: '90%', padding: 24, borderTopWidth: 1, borderColor: colors.line },
  closeDetailBtn: { alignSelf: 'flex-end', marginBottom: 10, zIndex: 10 },
  detailScrollContent: { paddingBottom: 40 },
  detailHeader: { marginBottom: 16 },
  detailTitle: { fontSize: 32, fontFamily: fonts.handwritingBold, color: colors.forestDark, marginBottom: 4 },
  detailDate: { fontSize: 17, fontFamily: fonts.handwriting, color: colors.muted },
  detailFeelingContainer: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.sageLight, alignSelf: 'flex-start', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, marginBottom: 24, gap: 8 },
  detailFeelingText: { fontSize: 18, fontFamily: fonts.handwritingBold, paddingHorizontal: 2},
  detailContentText: { fontSize: 21, fontFamily: fonts.handwriting, color: colors.ink, lineHeight: 29, marginTop: 10 },
  separator: { height: 1, backgroundColor: colors.line, width: '100%', marginBottom: 10 },
});