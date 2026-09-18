import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet, ImageBackground, ActivityIndicator, Keyboard, ScrollView, Platform } from 'react-native';
import { signOut } from 'firebase/auth';
import { auth, db } from '../../firebaseConfig'; 
import AsyncStorage from '@react-native-async-storage/async-storage';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import { DiaryEntry } from '../models/DiaryEntry';
import { EntryCard } from '../components/EntryCard';
import CreateEntryModal from '../components/modals/CreateEntryModal';
import { collection, limit, onSnapshot, orderBy, query, where } from 'firebase/firestore';
import DeleteEntryModal from '../components/modals/DeleteEntryModal';
import DetailEntryModal from '../components/modals/DetailEntryModal';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, fonts } from '../theme';
import { Feeling, feelingRecord } from '../types/Feeling';

export default function ProfilePage({ navigation }: any) {
  const user = auth.currentUser;

  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [isCreateModalVisible, setCreateModalVisible] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isDeleteModalVisible, setDeleteModalVisible] = useState(false);
  const [entryToDelete, setEntryToDelete] = useState<string | null>(null);
  const [isDetailModalVisible, setDetailModalVisible] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<DiaryEntry | null>(null);

  const openDetailModal = (entry: DiaryEntry) => {
    setSelectedEntry(entry);
    setDetailModalVisible(true);
  };
  const closeDetailModal = () => {
    setSelectedEntry(null);
    setDetailModalVisible(false);
  };


  useEffect(() => {
    if (!user) return;

    const q = query(
      collection(db, 'diaryEntries'),
      where('userId', '==', user.uid),
      orderBy('date', 'desc'),
      limit(2)
    );

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const entriesData: DiaryEntry[] = [];
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const date = data.date?.toDate ? data.date.toDate() : data.date;
        entriesData.push({ id: doc.id, ...data, date } as DiaryEntry);
      });
      setEntries(entriesData);
      setLoading(false);
    }, (error) => {
      console.error("Erreur lors de la récupération des journaux:", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSignOut = async () => {
    await AsyncStorage.removeItem('user_session').catch(() => {});
    await signOut(auth);
    navigation.replace('Home'); 
  };

  const openDeleteModal = (id: string) => {
    setEntryToDelete(id);
    setDeleteModalVisible(true);
  };

  const closeDeleteModal = () => {
    setEntryToDelete(null);
    setDeleteModalVisible(false);
  };

  if (!user) {
    return (
      <View style={styles.errorContainer}>
        <View style={styles.errorContent}>
            <Text style={{color: 'black'}}>Aucun utilisateur connecté.</Text>
            <TouchableOpacity onPress={() => navigation.replace('Login')} style={styles.signOutBtn}>
                <Text style={styles.btnText}>Aller à la connexion</Text>
            </TouchableOpacity>
        </View>
      </View>
    );
  }

  if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.forest} />
        </View>
      );
    }

  return (
    
    <SafeAreaView style={styles.mainContainer}>
        <ImageBackground
          source={require('../../assets/home_background.jpg')}
          style={styles.header}
          resizeMode="cover"
        >
            {user.photoURL && (
              Platform.OS === 'web' ? (
                <img 
                  src={user.photoURL} 
                  referrerPolicy="no-referrer"
                  style={styles.avatar}
                />
              ) : (
                <Image 
                  source={{ uri: user.photoURL }} 
                  style={styles.avatar} 
                />
              )
            )}
            <Text style={styles.userName}>
                {user.displayName || user.email}
            </Text>
        
            <TouchableOpacity onPress={handleSignOut} style={styles.signOutBtn}>
                <MaterialIcons name="logout" size={24} color="white" />
            </TouchableOpacity>
        </ImageBackground>
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>Mon Journal Intime</Text>
            <TouchableOpacity 
                style={styles.addBtn}
                onPress={() => setCreateModalVisible(true)}
            >
                <Text style={styles.addBtnText}>+ Écrire</Text>
            </TouchableOpacity>
        </View>
        {entries.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>Ton journal est vide.</Text>
          <Text style={styles.emptySubText}>Il est temps d'écrire ta première entrée !</Text>
        </View>
      ) : (
        <View>
          <View style={styles.lastEntriesContainer}>
            <Text style={styles.lastEntriesTitle}>Your last diary entries</Text>
            <ScrollView
              // style={styles.listContainer}
              contentContainerStyle={styles.listContent}
              onScrollBeginDrag={() => Keyboard.dismiss()}
              keyboardShouldPersistTaps="handled"
            >
              {entries.map((entry) => (
                <EntryCard
                  key={entry.id}
                  item={entry}
                  onDelete={openDeleteModal}
                  onOpenDetail={openDetailModal}
                />
              ))}
            </ScrollView>
          </View>
          <View style={styles.feelsContainer}>
              <Text style={styles.feelsTitle}>Your feel for yours {entries.length} entries</Text>
              <View>
                {Object.values(Feeling)
                  .filter((feel): feel is Feeling => typeof feel === 'number')
                  .map((feel) => {
                  const config = feelingRecord[feel];
                  const IconComponent = config.icon;
                  return (
                    <IconComponent key={config.label} size={24} color={config.color} />
                  );
                })}
              </View>
          </View>
        </View>
      )}

      <CreateEntryModal 
        visible={isCreateModalVisible} 
        onClose={() => setCreateModalVisible(false)} 
      />

      <DetailEntryModal
        entry={selectedEntry}
        visible={isDetailModalVisible}
        onClose={closeDetailModal}
      />

      <DeleteEntryModal
        entryToDelete={entryToDelete}
        visible={isDeleteModalVisible}
        onClose={closeDeleteModal}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  mainContainer: {
    flex: 1,
    backgroundColor: colors.paper,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.paper,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: 'auto',
    height: 140,
    padding: 12,
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    marginBottom: 16,
    borderWidth: 4,
    borderColor: colors.paperBright,
  },
  userName: {
    fontSize: 20,
    fontFamily: fonts.handwritingBold,
    color: colors.paperBright,
    textAlign: 'center',
    marginBottom: 4,
  },
  signOutBtn: {
    width: 'auto',
    backgroundColor: colors.danger,
    padding: 12,
    borderRadius: 12,
  },
  btnText: {
    color: '#fff',
    textAlign: 'center',
    fontWeight: '600',
    fontSize: 16,
  },
  errorContainer : {
    flex: 1,
    backgroundColor: colors.paper,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorContent: {
    justifyContent: 'center',
    alignItems: 'center',
    width: 'auto',
    padding: 24,
    borderRadius: 24,
    backgroundColor: colors.paperBright,
    gap: 24
  },
  // listContainer: {
  //   flex: 1,
  // },
  listContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 10,
  },
  lastEntriesContainer: {
    backgroundColor: colors.paperBright,
    padding: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    marginHorizontal: 20,
  },
  lastEntriesTitle: {
    fontFamily: fonts.handwritingBold,
    fontSize: 20,
    padding: 10
  },
  feelsContainer: {
    backgroundColor: colors.paperBright,
    padding: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.line,
    marginHorizontal: 20,
  },
  feelsTitle: {
    fontFamily: fonts.handwritingBold,
    fontSize: 20,
    padding: 10
  },

  // --- VIDE ---
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    marginTop: 30
  },
  emptyText: {
    fontSize: 30,
    fontFamily: fonts.handwritingBold,
    color: colors.ink,
    marginBottom: 8,
  },
  emptySubText: {
    fontSize: 20,
    color: colors.muted,
    fontFamily: fonts.body,
    textAlign: 'center',
  },
  sectionHeader: {
  flexDirection: 'row',
  justifyContent: 'space-between',
  alignItems: 'center',
  paddingHorizontal: 20,
  marginBottom: 15,
  marginTop: 15
},
// ADD ENTRY
sectionTitle: {
  fontSize: 30,
  fontFamily: fonts.handwritingBold,
  textAlign: 'center',
  color: colors.forestDark,
  paddingHorizontal: 2
},
addBtn: {
  backgroundColor: colors.forest,
  paddingHorizontal: 16,
  paddingVertical: 8,
  borderRadius: 8,
},
addBtnText: {
  color: colors.white,
  fontFamily: fonts.handwritingBold,
  fontSize: 18,
},
});