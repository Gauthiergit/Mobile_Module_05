import { deleteDoc, doc } from 'firebase/firestore';
import { useState } from 'react';
import { 
  View, Text, TouchableOpacity, StyleSheet, 
  ActivityIndicator, Modal 
} from 'react-native';
import { db } from '../../../firebaseConfig';
import { colors, fonts } from '../../theme';


interface DeleteEntryModalProps {
  entryToDelete: string | null
  visible: boolean;
  onClose: () => void;
}

export default function DeleteEntryModal({ entryToDelete, visible, onClose }: DeleteEntryModalProps) {

    const [isDeleting, setIsDeleting] = useState(false);
  
  const handleDeleteConfirm = async () => {
      if (!entryToDelete) return;
      
      setIsDeleting(true);
      try {
        await deleteDoc(doc(db, 'diaryEntries', entryToDelete));
        onClose();
      } catch (error) {
        console.error("Erreur lors de la suppression :", error);
        alert("Unable to delete the entry.");
      } finally {
        setIsDeleting(false);
      }
    };
  
  return (
    <Modal
        animationType="fade"
        transparent={true}
        visible={visible}
        onRequestClose={onClose}
        supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
      >
        <View style={styles.deleteModalOverlay}>
          <View style={styles.deleteModalContent}>
            <Text style={styles.deleteModalTitle}>Supprimer cette page ?</Text>
            <Text style={styles.deleteModalText}>
              Cette action est définitive. Tu ne pourras pas récupérer ce souvenir.
            </Text>
            
            <View style={styles.deleteModalActions}>
              <TouchableOpacity 
                style={styles.cancelDeleteBtn}
                onPress={onClose}
                disabled={isDeleting}
              >
                <Text style={styles.cancelDeleteBtnText}>Annuler</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.confirmDeleteBtn}
                onPress={handleDeleteConfirm}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Text style={styles.confirmDeleteBtnText}>Supprimer</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
  );
}

const styles = StyleSheet.create({
  deleteModalOverlay: { flex: 1, backgroundColor: 'rgba(31, 64, 55, 0.42)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  deleteModalContent: { backgroundColor: colors.paper, borderRadius: 12, padding: 24, width: '100%', maxWidth: 340, borderWidth: 1, borderColor: colors.line },
  deleteModalTitle: { fontSize: 27, fontFamily: fonts.handwritingBold, color: colors.forestDark, marginBottom: 12 },
  deleteModalText: { fontSize: 19, fontFamily: fonts.handwriting, color: colors.muted, lineHeight: 25, marginBottom: 24 },
  deleteModalActions: { flexDirection: 'row', gap: 12 },
  cancelDeleteBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: colors.line, alignItems: 'center' },
  cancelDeleteBtnText: { color: colors.ink, fontFamily: fonts.handwritingBold, fontSize: 18 },
  confirmDeleteBtn: { flex: 1, paddingVertical: 12, borderRadius: 8, backgroundColor: colors.danger, alignItems: 'center' },
  confirmDeleteBtnText: { color: colors.white, fontFamily: fonts.handwritingBold, fontSize: 18 },
});