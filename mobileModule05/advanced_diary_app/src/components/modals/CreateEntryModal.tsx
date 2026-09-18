import React, { useState, useEffect } from 'react';
import { 
  View, Text, TextInput, TouchableOpacity, StyleSheet, 
  ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, Modal 
} from 'react-native';
import { collection, addDoc } from 'firebase/firestore';
import { auth, db } from '../../../firebaseConfig';
import { AntDesign } from '@expo/vector-icons';
import { Feeling, feelingRecord } from '../../types/Feeling';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../../theme';

interface CreateEntryModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function CreateEntryModal({ visible, onClose }: CreateEntryModalProps) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [selectedFeeling, setSelectedFeeling] = useState<Feeling>(Feeling.Happy);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (visible) {
      setTitle('');
      setContent('');
      setSelectedFeeling(Feeling.Happy);
      setIsSubmitting(false);
    }
  }, [visible]);

  const handleSave = async () => {
    if (!title.trim() || !content.trim()) {
      alert("N'oublie pas de mettre un titre et un contenu !");
      return;
    }

    setIsSubmitting(true);
    try {
      const user = auth.currentUser;
      if (!user) throw new Error("Non connecté");

      await addDoc(collection(db, 'diaryEntries'), {
        userId: user.uid,
        email: user.email || 'Email masqué (GitHub)',
        title: title,
        content: content,
        feeling: selectedFeeling,
        date: new Date(),
      });

      onClose();
    } catch (error) {
      console.error("Erreur lors de la sauvegarde :", error);
      alert("Une erreur est survenue.");
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
      supportedOrientations={['portrait', 'landscape', 'landscape-left', 'landscape-right']}
    >
      <SafeAreaView style={styles.modalOverlay}>
        <KeyboardAvoidingView 
          style={styles.modalContent} 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          {/* Header de la modale avec bouton fermer */}
          <View style={styles.modalHeader}>
            <Text style={styles.pageTitle}>Nouvelle Entrée</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <AntDesign name="close" size={24} color="#9ca3af" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} keyboardShouldPersistTaps="handled">
            <Text style={styles.label}>Titre</Text>
            <TextInput
              style={styles.input}
              placeholder="Résumé de ma journée..."
              placeholderTextColor="#6b7280"
              maxLength={40}
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.label}>Comment te sens-tu ?</Text>
            <View style={styles.feelingsContainer}>
              {Object.values(Feeling)
                .filter((feel): feel is Feeling => typeof feel === 'number')
                .map((feel) => {
                const config = feelingRecord[feel];
                const IconComponent = config.icon;
                const isSelected = selectedFeeling === feel;

                return (
                  <TouchableOpacity
                    key={feel} 
                    style={[styles.feelingBtn, isSelected && { borderColor: config.color, backgroundColor: '#1f2937' }]}
                    onPress={() => setSelectedFeeling(feel as Feeling)}
                  >
                    <IconComponent size={24} color={isSelected ? config.color : '#6b7280'} />
                    <Text style={[styles.feelingLabel, isSelected && { color: config.color }]}>
                      {config.label}
                    </Text>
                  </TouchableOpacity>
                );
                })}
            </View>

            <Text style={styles.label}>Cher journal...</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Aujourd'hui, j'ai..."
              placeholderTextColor="#6b7280"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
              maxLength={2000}
              value={content}
              onChangeText={setContent}
            />

            <TouchableOpacity 
              style={[styles.saveBtn, isSubmitting && { opacity: 0.7 }]} 
              onPress={handleSave}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.saveBtnText}>Sauvegarder</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: { flex: 1, backgroundColor: 'rgba(31, 64, 55, 0.42)', justifyContent: 'flex-end' },
  modalContent: { backgroundColor: colors.paper, borderTopLeftRadius: 24, borderTopRightRadius: 24, padding: 20, maxHeight: '90%', borderTopWidth: 1, borderColor: colors.line },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  pageTitle: { fontSize: 30, fontFamily: fonts.handwritingBold, color: colors.forestDark, padding: 2 },
  closeBtn: { padding: 5 },
  label: { fontSize: 20, fontFamily: fonts.handwritingBold, color: colors.ink, marginBottom: 10, marginTop: 15 },
  input: { backgroundColor: colors.paperBright, borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 16, color: colors.ink, fontFamily: fonts.handwriting, fontSize: 19 },
  textArea: { minHeight: 120 },
  feelingsContainer: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', gap: 10 },
  feelingBtn: { width: '22%', minWidth: 72, alignItems: 'center', paddingVertical: 10, paddingHorizontal: 4, borderWidth: 1, borderColor: colors.line, borderRadius: 8, backgroundColor: colors.paperBright },
  feelingLabel: { fontSize: 16, marginTop: 6, color: colors.muted, fontFamily: fonts.handwritingBold, textAlign: 'center', flexShrink: 1, paddingHorizontal: 4},
  saveBtn: { marginTop: 30, marginBottom: 20, paddingVertical: 16, borderRadius: 8, backgroundColor: colors.forest, alignItems: 'center' },
  saveBtnText: { color: colors.white, fontFamily: fonts.handwritingBold, fontSize: 20 },
});